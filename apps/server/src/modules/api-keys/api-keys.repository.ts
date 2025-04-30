import type { Database } from '../app/database/database.types';
import { injectArguments } from '@corentinth/chisels';
import { and, count, eq, getTableColumns } from 'drizzle-orm';
import { omit } from 'lodash-es';
import { apiKeysTable } from './api-keys.table';

export type ApiKeysRepository = ReturnType<typeof createApiKeysRepository>;

export function createApiKeysRepository({ db }: { db: Database }) {
  return injectArguments(
    {
      saveApiKey,
      getUserApiKeys,
      deleteUserApiKey,
      getApiKeyByHash,
      countUserApiKeys,
    },
    { db },
  );
}

async function saveApiKey({ db, userId, name, prefix, keyHash }: {
  db: Database;
  userId: string;
  name: string;
  prefix: string;
  keyHash: string;
}) {
  const [apiKey] = await db
    .insert(apiKeysTable)
    .values({ userId, name, prefix, keyHash })
    .returning({
      ...omit(getTableColumns(apiKeysTable), ['token', 'keyHash']),
    });

  return { apiKey };
}

async function getUserApiKeys({ db, userId }: {
  db: Database;
  userId: string;
}) {
  const apiKeys = await db
    .select({
      // TODO: Remove token in a future migration
      ...omit(getTableColumns(apiKeysTable), ['token', 'keyHash']),
    })
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

async function getApiKeyByHash({ db, keyHash }: {
  db: Database;
  keyHash: string;
}) {
  const [apiKey] = await db
    .select({
      // TODO: Remove token in a future migration
      ...omit(getTableColumns(apiKeysTable), ['token', 'keyHash']),
    })
    .from(apiKeysTable)
    .where(
      eq(apiKeysTable.keyHash, keyHash),
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
