import type { Email } from './types';
import { fetch, type Fetch } from 'ofetch';
import { signBody } from './signature';
import { serializeEmailForWebhook } from './webhooks.models';

export async function triggerWebhook({
  email,
  webhookUrl,
  webhookSecret,
  httpClient = fetch,
}: {
  email: Email;
  webhookUrl: string;
  webhookSecret?: string | null;
  httpClient?: Fetch;
}) {
  const { body } = serializeEmailForWebhook({ email });
  const bodyResponse = new Response(body);

  const headers = Object.fromEntries(bodyResponse.headers.entries());
  const bodyBuffer = await bodyResponse.arrayBuffer();

  if (webhookSecret) {
    const { signature } = await signBody({ bodyBuffer, secret: webhookSecret });
    headers['X-Signature'] = signature;
  }

  const response = await httpClient(
    webhookUrl,
    {
      method: 'POST',
      body: bodyBuffer,
      headers,
    },
  );

  return {
    statusCode: response.status,
    isOk: response.ok,
  };
}
