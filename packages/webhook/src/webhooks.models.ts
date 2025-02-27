import type { Email } from './types';

export function serializeEmailForWebhook({ email }: { email: Email }) {
  const body = new FormData();

  const fields: Record<string, string | undefined> = {
    'from.address': email.from.address,
    'from.name': email.from.name,
    'subject': email.subject,
    'text': email.text,
    'html': email.html,

    ...(email.to ?? []).reduce((acc, to, index) => ({
      ...acc,
      [`to[${index}].address`]: to.address,
      [`to[${index}].name`]: to.name,
    }), {}),

    ...(email.cc ?? []).reduce((acc, cc, index) => ({
      ...acc,
      [`cc[${index}].address`]: cc.address,
      [`cc[${index}].name`]: cc.name,
    }), {}),

    ...(email.attachments ?? []).reduce((acc, attachment, index) => ({
      ...acc,
      [`attachments[${index}]`]: new File([attachment.content], attachment.filename ?? 'file', { type: attachment.mimeType }),
    }), {}),
  };

  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) {
      body.append(key, value);
    }
  }

  return { body };
}
