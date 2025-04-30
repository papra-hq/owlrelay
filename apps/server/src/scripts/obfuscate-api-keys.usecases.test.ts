import { omit } from 'lodash-es';
import { describe, expect, test } from 'vitest';
import { apiKeysTable } from '../modules/api-keys/api-keys.table';
import { createInMemoryDatabase } from '../modules/app/database/database.test-utils';
import { obfuscateApiKey } from './obfuscate-api-keys.usecases';

describe('obfuscate-api-keys script', () => {
  describe('obfuscateApiKey', () => {
    test('when a token is present, it is hashed, removed from the object and the prefix is kept', async () => {
      const { db } = await createInMemoryDatabase({
        users: [{ id: 'user_1', email: 'test@example.com' }],
        apiKeys: [
          { id: 'apikey_1', userId: 'user_1', token: 'owrl_29qxv9eCbRkQQGhwrVZCEXEFjOYpXZX07G4vDK4HT03Jp7fVHyJx1b0l6e1LIEPD', name: 'test' },
          { id: 'apikey_2', userId: 'user_1', name: 'test', keyHash: 'foo', prefix: 'bar' },
        ],
      });

      await obfuscateApiKey({ db });

      const apiKeys = await db.select().from(apiKeysTable);

      expect(
        apiKeys.map(apiKey => omit(apiKey, 'createdAt', 'updatedAt')),
      ).to.eql([
        { id: 'apikey_1', userId: 'user_1', name: 'test', token: null, prefix: 'owrl_29qxv', keyHash: 'pz-IKF5wZ7QJ88ic4kYuS0OdEwgPwNLUVSADOt8JBWk' },
        { id: 'apikey_2', userId: 'user_1', name: 'test', keyHash: 'foo', prefix: 'bar', token: null },
      ]);
    });
  });
});
