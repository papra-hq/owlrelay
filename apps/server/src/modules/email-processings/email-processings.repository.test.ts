import { describe, expect, test } from 'vitest';
import { createInMemoryDatabase } from '../app/database/database.test-utils';
import { PLANS } from '../plans/plans.constants';
import { createEmailProcessingsRepository } from './email-processings.repository';

describe('email-processings repository', () => {
  describe('deleteOutdatedEmailProcessings', () => {
    test('emails processings are deleted after 30 days for free plan, 90 days for pro plan, and never for other plans', async () => {
      const { db } = await createInMemoryDatabase({
        users: [
          { id: 'usr1', email: 'usr1@example.com', planId: PLANS.FREE.id },
          { id: 'usr2', email: 'usr2@example.com', planId: PLANS.PRO.id },
          { id: 'usr3', email: 'usr3@example.com', planId: 'other' },
        ],
        emailsCallbacks: [
          { id: 'ecb1', userId: 'usr1', domain: 'foo.fr', username: 'a', webhookUrl: 'https://example.com/webhook' },
          { id: 'ecb2', userId: 'usr2', domain: 'foo.fr', username: 'b', webhookUrl: 'https://example.com/webhook' },
          { id: 'ecb3', userId: 'usr3', domain: 'foo.fr', username: 'c', webhookUrl: 'https://example.com/webhook' },
        ],
        emailProcessings: [
          // For first email callback
          { emailCallbackId: 'ecb1', userId: 'usr1', createdAt: new Date('2025-04-19'), status: 'pending', fromAddress: 'foo@bar.fr', subject: 'test' },
          { emailCallbackId: 'ecb1', userId: 'usr1', createdAt: new Date('2025-03-19'), status: 'pending', fromAddress: 'foo@bar.fr', subject: 'test' },
          // For second email callback
          { emailCallbackId: 'ecb2', userId: 'usr2', createdAt: new Date('2025-04-19'), status: 'pending', fromAddress: 'foo@bar.fr', subject: 'test' },
          { emailCallbackId: 'ecb2', userId: 'usr2', createdAt: new Date('2025-03-19'), status: 'pending', fromAddress: 'foo@bar.fr', subject: 'test' },
          { emailCallbackId: 'ecb2', userId: 'usr2', createdAt: new Date('2025-02-19'), status: 'pending', fromAddress: 'foo@bar.fr', subject: 'test' },
          { emailCallbackId: 'ecb2', userId: 'usr2', createdAt: new Date('2025-01-19'), status: 'pending', fromAddress: 'foo@bar.fr', subject: 'test' },
          // For third email callback
          { emailCallbackId: 'ecb3', userId: 'usr3', createdAt: new Date('2025-04-19'), status: 'pending', fromAddress: 'foo@bar.fr', subject: 'test' },
          { emailCallbackId: 'ecb3', userId: 'usr3', createdAt: new Date('2025-03-19'), status: 'pending', fromAddress: 'foo@bar.fr', subject: 'test' },
        ],
      });
      const emailProcessingsRepository = createEmailProcessingsRepository({ db });

      const { deletedProcessingCount } = await emailProcessingsRepository.deleteOutdatedEmailProcessings({ now: new Date('2025-04-20') });

      expect(deletedProcessingCount).to.eql(2);
    });
  });
});
