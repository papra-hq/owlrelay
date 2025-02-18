import type { Logger } from '@crowlog/logger';
import type { Email } from 'postal-mime';
import type { EmailProcessingsRepository } from '../email-processings/email-processings.repository';
import type { PlansRepository } from '../plans/plans.respository';
import type { UsersRepository } from '../users/users.repository';
import type { EmailCallbacksRepository } from './email-callbacks.repository';
import { safely } from '@corentinth/chisels';
import PostalMime from 'postal-mime';
import { setupDatabase } from '../app/database/database';
import { parseConfig } from '../config/config';
import { EMAIL_PROCESSING_ERRORS, EMAIL_PROCESSING_STATUS } from '../email-processings/email-processings.constants';
import { createEmailProcessingsRepository } from '../email-processings/email-processings.repository';
import { createError } from '../shared/errors/errors';
import { createLogger } from '../shared/logger/logger';
import { filterEmailAddressesCandidates, getIsFromAllowedAddress } from './email-callbacks.models';
import { createEmailCallbacksRepository } from './email-callbacks.repository';

export async function canUserCreateEmailCallback({
  userId,
  usersRepository,
  plansRepository,
  emailCallbacksRepository,
}: {
  userId: string;
  usersRepository: UsersRepository;
  plansRepository: PlansRepository;
  emailCallbacksRepository: EmailCallbacksRepository;
}) {
  const { user } = await usersRepository.getUserByIdOrThrow({ userId });
  const { maxEmails } = await plansRepository.getPlanMaxEmails({ planId: user.planId });
  const { emailCallbacksCount } = await emailCallbacksRepository.getUserEmailCallbacksCount({ userId });

  if (emailCallbacksCount >= maxEmails) {
    return false;
  }

  return true;
}

export async function checkUserCanCreateEmailCallback({ userId, usersRepository, plansRepository, emailCallbacksRepository }: { userId: string; usersRepository: UsersRepository; plansRepository: PlansRepository; emailCallbacksRepository: EmailCallbacksRepository }) {
  const userCanCreateEmailCallback = await canUserCreateEmailCallback({ userId, usersRepository, plansRepository, emailCallbacksRepository });

  if (!userCanCreateEmailCallback) {
    throw createError({
      message: 'User cannot create email callback',
      statusCode: 429,
      code: 'email_callbacks.limit_reached',
    });
  }
}

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

  const response = await fetch(
    webhookUrl,
    {
      method: 'POST',
      body,
      headers: {
        'X-Signature': signature,
      },
    },
  );

  return {
    statusCode: response.status,
    isOk: response.ok,
  };
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
  emailProcessingsRepository,
  logger = createLogger({ namespace: 'email-callbacks' }),
}: {
  email: Email;
  username: string;
  domain: string;
  emailCallbacksRepository: EmailCallbacksRepository;
  emailProcessingsRepository: EmailProcessingsRepository;
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

  const processingCommonData = {
    emailCallbackId: emailCallback.id,
    userId: emailCallback.userId,
    fromAddress: email.from.address ?? '',
    subject: email.subject ?? '',
  };

  const isEnabled = emailCallback.isEnabled;

  if (!isEnabled) {
    logger.info({ username, domain }, 'Email callback is not enabled');
    await emailProcessingsRepository.createEmailProcessing({
      emailProcessing: {
        ...processingCommonData,
        status: EMAIL_PROCESSING_STATUS.NOT_PROCESSED,
        error: EMAIL_PROCESSING_ERRORS.NOT_ENABLED,
      },
    });
    return;
  }

  const isFromAllowedAddress = getIsFromAllowedAddress({
    fromAddress: email.from.address,
    allowedOrigins: emailCallback.allowedOrigins,
  });

  if (!isFromAllowedAddress) {
    logger.info({ username, domain }, 'From address not allowed');
    await emailProcessingsRepository.createEmailProcessing({
      emailProcessing: {
        ...processingCommonData,
        status: EMAIL_PROCESSING_STATUS.NOT_PROCESSED,
        error: EMAIL_PROCESSING_ERRORS.FROM_ADDRESS_NOT_ALLOWED,
      },
    });
    return;
  }

  const { webhookUrl, webhookSecret } = emailCallback;

  const { statusCode, isOk } = await triggerWebhook({ email, webhookUrl, webhookSecret });

  if (!isOk) {
    logger.error({ statusCode }, 'Error triggering webhook');
    await emailProcessingsRepository.createEmailProcessing({
      emailProcessing: {
        ...processingCommonData,
        status: EMAIL_PROCESSING_STATUS.ERROR,
        error: EMAIL_PROCESSING_ERRORS.WEBHOOK_FAILED,
        webhookResponseStatusCode: statusCode,
      },
    });
    return;
  }

  await emailProcessingsRepository.createEmailProcessing({
    emailProcessing: {
      ...processingCommonData,
      status: EMAIL_PROCESSING_STATUS.SUCCESS,
      webhookResponseStatusCode: statusCode,
    },
  });
}

export function createEmailHandler({ logger = createLogger({ namespace: 'email-callbacks' }) }: { logger?: Logger } = {}) {
  return async (message: ForwardableEmailMessage, env: Record<string, string | undefined>) => {
    const { config } = parseConfig({ env });
    const { db } = setupDatabase(config.database);
    const emailCallbacksRepository = createEmailCallbacksRepository({ db });
    const emailProcessingsRepository = createEmailProcessingsRepository({ db });

    const { email } = await parseEmail({ rawMessage: message.raw });

    const { emailAddresses } = filterEmailAddressesCandidates({
      emailAddresses: email.to,
      allowedDomains: config.emailCallbacks.availableDomains,
    });

    for (const { username, domain } of emailAddresses) {
      const [, error] = await safely(processEmail({ email, username, domain, emailCallbacksRepository, emailProcessingsRepository }));

      if (error) {
        logger.error({ error }, 'Error processing email');
      }
    }
  };
}
