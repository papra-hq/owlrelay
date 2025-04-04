import { describe, expect, test } from 'vitest';
import { createInMemoryDatabase } from '../app/database/database.test-utils';
import { createEmailCallbackAlreadyExistsError } from './email-callbacks.errors';
import { createEmailCallbacksRepository } from './email-callbacks.repository';

describe('email-callbacks repository', () => {
  describe('createUserEmailCallback', () => {
    test('the tuple domain/username must be unique regardless of the user, an error is raised if it already exists', async () => {
      const { db } = await createInMemoryDatabase({
        users: [{ id: 'user-1', email: 'foo@example.fr' }],
        emailsCallbacks: [{
          userId: 'user-1',
          username: 'foo',
          domain: 'example.fr',
          webhookUrl: 'https://example.fr/webhook',
        }],
      });

      const emailCallbacksRepository = createEmailCallbacksRepository({ db });

      await expect(
        emailCallbacksRepository.createUserEmailCallback({
          userId: 'user-1',
          emailCallback: {
            username: 'foo',
            domain: 'example.fr',
            webhookUrl: 'https://example.fr/webhook',
            userId: 'user-1',
          },
        }),
      ).rejects.toThrow(createEmailCallbackAlreadyExistsError());

      await expect(
        emailCallbacksRepository.createUserEmailCallback({
          userId: 'user-2', // different user
          emailCallback: {
            username: 'foo',
            domain: 'example.fr',
            webhookUrl: 'https://example.fr/webhook',
            userId: 'user-1',
          },
        }),
      ).rejects.toThrow(createEmailCallbackAlreadyExistsError());
    });
  });
});
