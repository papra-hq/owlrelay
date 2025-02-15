import type { Address } from 'postal-mime';
import type { EmailCallback } from './email-callbacks.types';
import { Config } from '../config/config.types';

export function formatEmailCallbackForApi({ emailCallback }: { emailCallback: EmailCallback }) {
  return {
    ...emailCallback,
    webhookSecret: '************************',
  };
}

export function parseEmailAddress({
  emailAddress,
}: {
  emailAddress: string;
}): {
    username: string;
    domain: string;
    extra?: string;
  } {
  const [localPart, domain] = emailAddress.split('@');

  const [username, extra] = localPart.split('+');

  return {
    username,
    domain,
    extra,
  };
}

export function filterEmailAddressesCandidates({
  emailAddresses,
  allowedDomains,
}: {
  emailAddresses?: Address[];
  allowedDomains: string[];
}) {
  if (!emailAddresses) {
    return {
      emailAddresses: [],
    };
  }

  const filteredEmailAddresses = emailAddresses
    .map(({ address }) => address ? parseEmailAddress({ emailAddress: address }) : undefined)
    .filter(emailAddress => emailAddress !== undefined && allowedDomains.includes(emailAddress.domain)) as {
    username: string;
    domain: string;
    extra?: string;
  }[];

  return {
    emailAddresses: filteredEmailAddresses,
  };
}

export function getIsFromAllowedAddress({
  fromAddress,
  allowedOrigins,
}: {
  fromAddress?: string;
  allowedOrigins: string[];
}) {
  if (!fromAddress) {
    return false;
  }

  if (allowedOrigins.length === 0) {
    return true;
  }

  return allowedOrigins
    .map(allowedOrigin => allowedOrigin.toLowerCase())
    .includes(fromAddress.toLowerCase());
}
