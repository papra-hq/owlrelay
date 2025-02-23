import type { Email } from 'postal-mime';
import { describe, expect, test } from 'vitest';
import { signBody, triggerWebhook } from './webhooks.usecases';

describe('webhooks usecases', () => {
  describe('triggerWebhook', () => {
    test('the webhook is triggered with the email serialized as a form data, with the attachments for the webhook and a HMAC-SHA256 signature if the webhook secret is provided', async () => {
      const email = {
        from: {
          address: 'from@example.com',
          name: 'John Doe',
        },
      } as Email;

      const fetchArgs: { url: string; options: RequestInit }[] = [];

      const httpClient: any = (url: string, options: RequestInit) => {
        fetchArgs.push({ url, options });
        return Promise.resolve({ status: 200, ok: true });
      };

      await triggerWebhook({
        email,
        webhookUrl: 'https://example.com',
        webhookSecret: 'secret',
        httpClient,
      });

      expect(fetchArgs[0].url).to.eql('https://example.com');
      expect(fetchArgs[0].options.method).to.eql('POST');

      const bodyBuffer = fetchArgs[0].options.body as ArrayBuffer;
      const signatureHeader = (fetchArgs[0].options.headers as Record<string, string>)['X-Signature'];

      const { signature } = await signBody({
        bodyBuffer,
        secret: 'secret',
      });

      expect(signatureHeader).to.eql(signature);
    });
  });
});
