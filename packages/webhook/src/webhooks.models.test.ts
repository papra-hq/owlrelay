import type { Email } from 'postal-mime';
import { describe, expect, test } from 'vitest';
import { serializeEmailForWebhook } from './webhooks.models';

describe('webhooks models', () => {
  describe('serializeEmailForWebhook', () => {
    test('the email content is serialized as a form data, with the attachments for the webhook', async () => {
      const email = {
        from: {
          address: 'from@example.com',
          name: 'John Doe',
        },
        to: [
          {
            address: 'jane@example.com',
            name: 'Jane Doe',
          },
          {
            address: 'jack@example.com',
            name: 'Jack Doe',
          },
        ],
        subject: 'Test subject',
        text: 'Text content',
        html: 'HTML content',
        attachments: [{
          content: 'Test',
          filename: 'test.txt',
          mimeType: 'text/plain',
        }],
      } as Email;

      const { body } = serializeEmailForWebhook({ email });

      const entries = Array.from(body.entries());
      const file = entries.at(-1)!;
      const rest = entries.slice(0, -1);

      expect(rest).to.eql([
        ['from.address', 'from@example.com'],
        ['from.name', 'John Doe'],
        ['subject', 'Test subject'],
        ['text', 'Text content'],
        ['html', 'HTML content'],
        ['to[0].address', 'jane@example.com'],
        ['to[0].name', 'Jane Doe'],
        ['to[1].address', 'jack@example.com'],
        ['to[1].name', 'Jack Doe'],
      ]);

      expect(file[0]).to.eql('attachments[0]');
      expect(file[1]).to.be.instanceOf(File);
      expect((file[1] as any).name).to.eql('test.txt');
      expect((file[1] as any).type).to.eql('text/plain');
      expect(await (file[1] as any).text()).to.eql('Test');
    });
  });
});
