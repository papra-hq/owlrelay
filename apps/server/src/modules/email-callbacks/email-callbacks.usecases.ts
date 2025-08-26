import type { Logger } from '@crowlog/logger';
import type { Email } from 'postal-mime';
import type { EmailProcessingsRepository } from '../email-processings/email-processings.repository';
import type { PlansRepository } from '../plans/plans.respository';
import type { UsersRepository } from '../users/users.repository';
import type { EmailCallbacksRepository } from './email-callbacks.repository';
import { safely } from '@corentinth/chisels';
import { triggerWebhook } from '@owlrelay/webhook';
import PostalMime from 'postal-mime';
import { setupDatabase } from '../app/database/database';
import { parseConfig } from '../config/config';
import { EMAIL_PROCESSING_ERRORS, EMAIL_PROCESSING_STATUS } from '../email-processings/email-processings.constants';
import { createEmailProcessingsRepository } from '../email-processings/email-processings.repository';
import { createError } from '../shared/errors/errors';
import { createLogger } from '../shared/logger/logger';
import { createEmailCallbackNotFoundError, createInvalidEmailCallbackAddressError } from './email-callbacks.errors';
import { filterEmailAddressesCandidates, getIsFromAllowedAddress, isEmailCallbackId, parseEmailAddress } from './email-callbacks.models';
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

  const { status: statusCode, ok: isOk } = await triggerWebhook({ email, webhookUrl, webhookSecret });

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
    logger.info({ from: message.from, to: message.to }, 'Email received');

    const { config } = parseConfig({ env });
    const { db } = setupDatabase(config.database);
    const emailCallbacksRepository = createEmailCallbacksRepository({ db });
    const emailProcessingsRepository = createEmailProcessingsRepository({ db });

    const { email } = await parseEmail({ rawMessage: message.raw });

    logger.info({ from: email.from, to: email.to }, 'Parsed email');

    const parsedRecipientAddresses = email.to?.map(to => to.address).filter(Boolean) ?? [];

    const { emailAddresses } = filterEmailAddressesCandidates({
      // Using message.to as fallback as in some forward cases, the owlrelay destination email does not appears in the parsed to field
      emailAddresses: [message.to, ...parsedRecipientAddresses],
      allowedDomains: config.emailCallbacks.availableDomains,
    });

    if (emailAddresses.length === 0) {
      logger.info({ from: message.from, to: message.to }, 'No matching domains found');
      return;
    }

    for (const { username, domain } of emailAddresses) {
      const [, error] = await safely(processEmail({ email, username, domain, emailCallbacksRepository, emailProcessingsRepository }));

      if (error) {
        logger.error({ error }, 'Error processing email');
      }
    }
  };
}

export async function deleteEmailCallback({ emailCallbackIdOrAddress, emailCallbacksRepository, userId }: { emailCallbackIdOrAddress: string; emailCallbacksRepository: EmailCallbacksRepository; userId: string }) {
  if (isEmailCallbackId(emailCallbackIdOrAddress)) {
    const { deletedId } = await emailCallbacksRepository.deleteUserEmailCallback({ userId, emailCallbackId: emailCallbackIdOrAddress });

    if (!deletedId) {
      throw createEmailCallbackNotFoundError();
    }

    return;
  }

  const { username, domain } = parseEmailAddress({ emailAddress: emailCallbackIdOrAddress });

  if (!username || !domain) {
    // Should not happen, has emailCallbackIdOrAddress is validated by the route
    throw createInvalidEmailCallbackAddressError();
  }

  const { emailCallback } = await emailCallbacksRepository.getEmailCallbackByUsernameAndDomain({ username, domain });

  if (!emailCallback) {
    throw createEmailCallbackNotFoundError();
  }

  const { deletedId } = await emailCallbacksRepository.deleteUserEmailCallback({ userId, emailCallbackId: emailCallback.id });

  if (!deletedId) {
    throw createEmailCallbackNotFoundError();
  }
}
