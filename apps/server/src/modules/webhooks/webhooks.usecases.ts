import type { Email } from 'postal-mime';
import { fetch, type Fetch } from 'ofetch';
import { serializeEmailForWebhook } from './webhooks.models';

export async function signBody({
  bodyBuffer,
  secret,
}: {
  bodyBuffer: ArrayBuffer;
  secret: string;
}) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, bodyBuffer);

  const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));

  return { signature };
}

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
