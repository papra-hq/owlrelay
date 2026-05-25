import type { EmailCallbacksRepository } from './email-callbacks.repository';
import { describe, expect, test } from 'vitest';
import { createInMemoryDatabase } from '../app/database/database.test-utils';
import { createEmailCallbackNotFoundError, createInvalidEmailCallbackAddressError } from './email-callbacks.errors';
import { createEmailCallbacksRepository } from './email-callbacks.repository';
import { emailsCallbacksTable } from './email-callbacks.table';
import { deleteEmailCallback, resolveUserEmailCallbackId } from './email-callbacks.usecases';

describe('email-callbacks usecases', () => {
  describe('deleteEmailCallback', () => {
    describe('email callbacks can be delete either by id or by address', () => {
      test("it's possible to delete an email callback by id", async () => {
        const { db } = await createInMemoryDatabase({
          users: [{ id: 'user-1', email: 'foo@example.fr' }],
          emailsCallbacks: [
            {
              id: 'ecb_a111111', // should be a valid email callback id format
              userId: 'user-1',
              username: 'bar',
              domain: 'callback.email',
              webhookUrl: 'https://example.fr/webhook',
            },
          ],
        });

        const emailCallbacksRepository = createEmailCallbacksRepository({ db });

        await deleteEmailCallback({ userId: 'user-1', emailCallbackIdOrAddress: 'ecb_a111111', emailCallbacksRepository });

        const emailCallbacks = await db.select().from(emailsCallbacksTable);

        expect(emailCallbacks).toEqual([]);
      });

      test("it's not possible to delete an email callback by id that does not exist", async () => {
        const { db } = await createInMemoryDatabase({
          users: [{ id: 'user-1', email: 'foo@example.fr' }],
        });

        const emailCallbacksRepository = createEmailCallbacksRepository({ db });

        await expect(deleteEmailCallback({ userId: 'user-1', emailCallbackIdOrAddress: 'ecb_a111111', emailCallbacksRepository })).rejects.toThrow(createEmailCallbackNotFoundError());
      });

      test("it's possible to delete an email callback by address", async () => {
        const { db } = await createInMemoryDatabase({
          users: [{ id: 'user-1', email: 'foo@example.fr' }],
          emailsCallbacks: [
            {
              id: 'ecb_a111111', // should be a valid email callback id format
              userId: 'user-1',
              username: 'bar',
              domain: 'callback.email',
              webhookUrl: 'https://example.fr/webhook',
            },
          ],
        });

        const emailCallbacksRepository = createEmailCallbacksRepository({ db });

        await deleteEmailCallback({ userId: 'user-1', emailCallbackIdOrAddress: 'bar@callback.email', emailCallbacksRepository });

        const emailCallbacks = await db.select().from(emailsCallbacksTable);

        expect(emailCallbacks).toEqual([]);
      });

      test('when for some reason the address is not valid, an error is raised', async () => {
        await expect(
          deleteEmailCallback({
            userId: 'user-1',
            emailCallbackIdOrAddress: 'invalid-address',
            emailCallbacksRepository: {} as EmailCallbacksRepository,
          }),
        ).rejects.toThrow(createInvalidEmailCallbackAddressError());
      });

      test("it's not possible to delete an email callback of another user", async () => {
        const { db } = await createInMemoryDatabase({
          users: [
            { id: 'user-1', email: 'foo@example.fr' },
            { id: 'user-2', email: 'bar@example.fr' },
          ],
          emailsCallbacks: [
            {
              id: 'ecb_a111111', // should be a valid email callback id format
              userId: 'user-1',
              username: 'bar',
              domain: 'callback.email',
              webhookUrl: 'https://example.fr/webhook',
            },
          ],
        });

        const emailCallbacksRepository = createEmailCallbacksRepository({ db });

        await expect(deleteEmailCallback({ userId: 'user-2', emailCallbackIdOrAddress: 'bar@callback.email', emailCallbacksRepository })).rejects.toThrow(createEmailCallbackNotFoundError());
      });
    });
  });

  describe('resolveUserEmailCallbackId', () => {
    test('when given a valid email callback id, it resolves to the email callback id', async () => {
      const { db } = await createInMemoryDatabase({
        users: [{ id: 'user-1', email: 'foo@example.fr' }],
        emailsCallbacks: [
          {
            id: 'ecb_a111111',
            userId: 'user-1',
            username: 'bar',
            domain: 'callback.email',
            webhookUrl: 'https://example.fr/webhook',
          },
        ],
      });

      const emailCallbacksRepository = createEmailCallbacksRepository({ db });

      const { emailCallbackId } = await resolveUserEmailCallbackId({
        emailCallbackIdOrAddress: 'ecb_a111111',
        userId: 'user-1',
        emailCallbacksRepository,
      });

      expect(emailCallbackId).toBe('ecb_a111111');
    });

    test('when given an email address, it resolves to the matching email callback id', async () => {
      const { db } = await createInMemoryDatabase({
        users: [{ id: 'user-1', email: 'foo@example.fr' }],
        emailsCallbacks: [
          {
            id: 'ecb_a111111',
            userId: 'user-1',
            username: 'bar',
            domain: 'callback.email',
            webhookUrl: 'https://example.fr/webhook',
          },
        ],
      });

      const emailCallbacksRepository = createEmailCallbacksRepository({ db });

      const { emailCallbackId } = await resolveUserEmailCallbackId({
        emailCallbackIdOrAddress: 'bar@callback.email',
        userId: 'user-1',
        emailCallbacksRepository,
      });

      expect(emailCallbackId).toBe('ecb_a111111');
    });

    test('when given an email callback id that does not exist, it throws a not found error', async () => {
      const { db } = await createInMemoryDatabase({
        users: [{ id: 'user-1', email: 'foo@example.fr' }],
      });

      const emailCallbacksRepository = createEmailCallbacksRepository({ db });

      await expect(
        resolveUserEmailCallbackId({
          emailCallbackIdOrAddress: 'ecb_a111111',
          userId: 'user-1',
          emailCallbacksRepository,
        }),
      ).rejects.toThrow(createEmailCallbackNotFoundError());
    });

    test('when given an email address that does not match any callback, it throws a not found error', async () => {
      const { db } = await createInMemoryDatabase({
        users: [{ id: 'user-1', email: 'foo@example.fr' }],
      });

      const emailCallbacksRepository = createEmailCallbacksRepository({ db });

      await expect(
        resolveUserEmailCallbackId({
          emailCallbackIdOrAddress: 'unknown@callback.email',
          userId: 'user-1',
          emailCallbacksRepository,
        }),
      ).rejects.toThrow(createEmailCallbackNotFoundError());
    });

    test('when given an invalid address (no domain), it throws an invalid address error', async () => {
      await expect(
        resolveUserEmailCallbackId({
          emailCallbackIdOrAddress: 'invalid-address',
          userId: 'user-1',
          emailCallbacksRepository: {} as EmailCallbacksRepository,
        }),
      ).rejects.toThrow(createInvalidEmailCallbackAddressError());
    });

    test('when given an email callback id belonging to another user, it throws a not found error', async () => {
      const { db } = await createInMemoryDatabase({
        users: [
          { id: 'user-1', email: 'foo@example.fr' },
          { id: 'user-2', email: 'bar@example.fr' },
        ],
        emailsCallbacks: [
          {
            id: 'ecb_a111111',
            userId: 'user-1',
            username: 'bar',
            domain: 'callback.email',
            webhookUrl: 'https://example.fr/webhook',
          },
        ],
      });

      const emailCallbacksRepository = createEmailCallbacksRepository({ db });

      await expect(
        resolveUserEmailCallbackId({
          emailCallbackIdOrAddress: 'ecb_a111111',
          userId: 'user-2',
          emailCallbacksRepository,
        }),
      ).rejects.toThrow(createEmailCallbackNotFoundError());
    });

    test('when given an email address belonging to another user, it throws a not found error', async () => {
      const { db } = await createInMemoryDatabase({
        users: [
          { id: 'user-1', email: 'foo@example.fr' },
          { id: 'user-2', email: 'bar@example.fr' },
        ],
        emailsCallbacks: [
          {
            id: 'ecb_a111111',
            userId: 'user-1',
            username: 'bar',
            domain: 'callback.email',
            webhookUrl: 'https://example.fr/webhook',
          },
        ],
      });

      const emailCallbacksRepository = createEmailCallbacksRepository({ db });

      await expect(
        resolveUserEmailCallbackId({
          emailCallbackIdOrAddress: 'bar@callback.email',
          userId: 'user-2',
          emailCallbacksRepository,
        }),
      ).rejects.toThrow(createEmailCallbackNotFoundError());
    });
  });
});
