export function coerceDate<T extends { createdAt: string; updatedAt: string }>(
  obj: T,
): T & { createdAt: Date; updatedAt: Date } {
  return {
    ...obj,
    createdAt: new Date(obj.createdAt),
    updatedAt: new Date(obj.updatedAt),
  } as T & { createdAt: Date; updatedAt: Date };
}

export function getEmailIdentifier(args: { emailId: string } | { emailAddress: string } | { username: string; domain: string }) {
  if ('emailId' in args) {
    return { emailIdentifier: args.emailId };
  }

  if ('emailAddress' in args) {
    return { emailIdentifier: args.emailAddress };
  }

  return { emailIdentifier: `${args.username}@${args.domain}` };
}
