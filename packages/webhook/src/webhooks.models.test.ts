import type { Email } from 'postal-mime';
import { describe, expect, test } from 'vitest';
import { serializeEmailForWebhook } from './webhooks.models';

describe('webhooks models', () => {
  describe('serializeEmailForWebhook', () => {
    test('the email is serialized as a form data, with the attachments as a files array and the rest as a json string', async () => {
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
      const [emailEntry, ...attachments] = entries;

      expect(emailEntry).to.eql(['email', '{"from":{"address":"from@example.com","name":"John Doe"},"to":[{"address":"jane@example.com","name":"Jane Doe"},{"address":"jack@example.com","name":"Jack Doe"}],"subject":"Test subject","text":"Text content","html":"HTML content"}']);

      expect(attachments).to.have.length(1);

      const [key, value] = attachments[0]!;

      expect(key).to.eql('attachments[]');
      expect(value).to.be.instanceOf(File);
      expect((value as any).name).to.eql('test.txt');
      expect((value as any).type).to.eql('text/plain');
      expect(await (value as any).text()).to.eql('Test');
    });
  });
});
