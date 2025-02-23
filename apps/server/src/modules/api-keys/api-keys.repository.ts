import type { Database } from '../app/database/database.types';
import { injectArguments } from '@corentinth/chisels';
import { and, count, eq } from 'drizzle-orm';
import { apiKeysTable } from './api-keys.table';

export type ApiKeysRepository = ReturnType<typeof createApiKeysRepository>;

export function createApiKeysRepository({ db }: { db: Database }) {
  return injectArguments(
    {
      createApiKey,
      getUserApiKeys,
      deleteUserApiKey,
      getApiKeyByToken,
      countUserApiKeys,
    },
    { db },
  );
}

async function createApiKey({ db, userId, name }: {
  db: Database;
  userId: string;
  name: string;
}) {
  const [apiKey] = await db.insert(apiKeysTable).values({ userId, name }).returning();

  return { apiKey };
}

async function getUserApiKeys({ db, userId }: {
  db: Database;
  userId: string;
}) {
  const apiKeys = await db
    .select()
    .from(apiKeysTable)
    .where(
      eq(apiKeysTable.userId, userId),
    );

  return { apiKeys };
}

async function deleteUserApiKey({
  db,
  apiKeyId,
  userId,
}: {
  db: Database;
  apiKeyId: string;
  userId: string;
}) {
  await db.delete(apiKeysTable).where(
    and(
      eq(apiKeysTable.id, apiKeyId),
      eq(apiKeysTable.userId, userId),
    ),
  );
}

async function getApiKeyByToken({ db, token }: {
  db: Database;
  token: string;
}) {
  const [apiKey] = await db
    .select()
    .from(apiKeysTable)
    .where(
      eq(apiKeysTable.token, token),
    );

  return { apiKey };
}

async function countUserApiKeys({ db, userId }: {
  db: Database;
  userId: string;
}) {
  const [{ apiKeysCount }] = await db
    .select({ apiKeysCount: count() })
    .from(apiKeysTable)
    .where(
      eq(apiKeysTable.userId, userId),
    );

  return { apiKeysCount };
}
