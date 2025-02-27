import type { Email } from './types';

export function serializeEmailForWebhook({ email }: { email: Email }) {
  const body = new FormData();
  const { attachments = [], ...rest } = email;

  body.append('email', JSON.stringify(rest));

  for (const attachment of attachments ?? []) {
    body.append('attachments[]', new File([attachment.content], attachment.filename ?? 'file', { type: attachment.mimeType }));
  }

  return { body };
}
