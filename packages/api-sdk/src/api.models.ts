import type { OwlRelayEmailIdentifier } from './api.types';

export function coerceDate<T extends { createdAt: string; updatedAt: string }>(obj: T): T & { createdAt: Date; updatedAt: Date } {
  return {
    ...obj,
    createdAt: new Date(obj.createdAt),
    updatedAt: new Date(obj.updatedAt),
  } as T & { createdAt: Date; updatedAt: Date };
}

export function getEmailIdentifier(args: OwlRelayEmailIdentifier) {
  if ('emailId' in args) {
    return { emailIdentifier: args.emailId };
  }

  if ('emailAddress' in args) {
    return { emailIdentifier: args.emailAddress };
  }

  return { emailIdentifier: `${args.username}@${args.domain}` };
}
