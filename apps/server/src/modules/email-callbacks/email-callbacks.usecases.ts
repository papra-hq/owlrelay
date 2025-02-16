import type { Logger } from '@crowlog/logger';
import type { Email } from 'postal-mime';
import type { EmailCallbacksRepository } from './email-callbacks.repository';
import { safely } from '@corentinth/chisels';
import PostalMime from 'postal-mime';
import { setupDatabase } from '../app/database/database';
import { parseConfig } from '../config/config';
import { createLogger } from '../shared/logger/logger';
import { filterEmailAddressesCandidates, getIsFromAllowedAddress } from './email-callbacks.models';
import { createEmailCallbacksRepository } from './email-callbacks.repository';

async function parseEmail({ rawMessage }: { rawMessage: ReadableStream<Uint8Array> }) {
  const rawEmail = new Response(rawMessage);
  const parser = new PostalMime();

  const emailBuffer = await rawEmail.arrayBuffer();
  const email = await parser.parse(emailBuffer);

  return { email };
}

async function triggerWebhook({ email, webhookUrl, webhookSecret }: { email: Email; webhookUrl: string; webhookSecret: string }) {
  const body = new FormData();

  body.append('meta', JSON.stringify({ to: email.to, from: email.from }));

  for (const attachment of email.attachments) {
    body.append('attachments[]', new Blob([attachment.content], { type: attachment.mimeType }), attachment.filename ?? 'file');
  }

  const { signature } = await signBody({ body, secret: webhookSecret });

  await fetch(
    webhookUrl,
    {
      method: 'POST',
      body,
      headers: {
        'X-Signature': signature,
      },
    },
  );
}

async function signBody({ body, secret }: { body: FormData; secret: string }) {
  const bodyBuffer = await new Response(body).arrayBuffer();
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, bodyBuffer);

  const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));

  return { signature };
}

async function processEmail({
  email,
  username,
  domain,
  emailCallbacksRepository,
  logger = createLogger({ namespace: 'email-callbacks' }),
}: {
  email: Email;
  username: string;
  domain: string;
  emailCallbacksRepository: EmailCallbacksRepository;
  logger?: Logger;
}) {
  const { emailCallback } = await emailCallbacksRepository.getEmailCallbackByUsernameAndDomain({
    username,
    domain,
  });

  if (!emailCallback) {
    logger.info({ username, domain }, 'No email callback found');
    return;
  }

  const isEnabled = emailCallback.isEnabled;

  if (!isEnabled) {
    logger.info({ username, domain }, 'Email callback is not enabled');
    return;
  }

  const isFromAllowedAddress = getIsFromAllowedAddress({
    fromAddress: email.from.address,
    allowedOrigins: emailCallback.allowedOrigins,
  });

  if (!isFromAllowedAddress) {
    logger.info({ username, domain }, 'From address not allowed');
    return;
  }

  const { webhookUrl, webhookSecret } = emailCallback;

  const [, error] = await safely(triggerWebhook({ email, webhookUrl, webhookSecret }));

  if (error) {
    logger.error({ error }, 'Error triggering webhook');
  }
}

export function createEmailHandler({ logger = createLogger({ namespace: 'email-callbacks' }) }: { logger?: Logger } = {}) {
  return async (message: ForwardableEmailMessage, env: Record<string, string | undefined>) => {
    const { config } = parseConfig({ env });
    const { db } = setupDatabase(config.database);
    const emailCallbacksRepository = createEmailCallbacksRepository({ db });

    const { email } = await parseEmail({ rawMessage: message.raw });

    const { emailAddresses } = filterEmailAddressesCandidates({
      emailAddresses: email.to,
      allowedDomains: config.emailCallbacks.availableDomains,
    });

    for (const { username, domain } of emailAddresses) {
      const [, error] = await safely(processEmail({ email, username, domain, emailCallbacksRepository }));

      if (error) {
        logger.error({ error }, 'Error processing email');
      }
    }
  };
}
