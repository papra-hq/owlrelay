import { and, count, desc, eq, sql } from 'drizzle-orm';
import { getTableConfig } from 'drizzle-orm/sqlite-core';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { apiKeysTable } from '../../api-keys/api-keys.table';
import { emailsCallbacksTable } from '../../email-callbacks/email-callbacks.table';
import { emailProcessingsTable } from '../../email-processings/email-processings.table';
import { accountsTable, sessionsTable } from '../auth/auth.tables';
import { setupDatabase } from './database';
import { runMigrations } from './database.services';

describe('database indexes', () => {
  const { db, client } = setupDatabase({ url: ':memory:' });

  beforeAll(async () => {
    await runMigrations({ db });
  });

  afterAll(() => {
    client.close();
  });

  test.each([apiKeysTable, emailsCallbacksTable, emailProcessingsTable, accountsTable, sessionsTable].map(table => getTableConfig(table)))(
    '$name indexes match the Drizzle schema after migrations',
    async ({ name, indexes }) => {
      const migratedIndexes = await db.all<{ name: string; unique: number }>(sql`SELECT name, "unique" FROM pragma_index_list(${name})`);

      for (const { config } of indexes) {
        expect(migratedIndexes).toContainEqual({ name: config.name, unique: Number(config.unique) });

        const columns = await db.all<{ name: string }>(sql`SELECT name FROM pragma_index_info(${config.name}) ORDER BY seqno`);

        expect(columns.map(column => column.name)).toEqual(config.columns.map(column => ('name' in column ? column.name : undefined)));
      }
    },
  );

  test.each([
    { table: 'api_keys', predicate: "user_id = 'usr1'", index: 'api_keys_user_id_index' },
    { table: 'emails_callbacks', predicate: "user_id = 'usr1'", index: 'emails_callbacks_user_id_index' },
    { table: 'email_processings', predicate: "user_id = 'usr1'", index: 'email_processings_user_id_index' },
    { table: 'email_processings', predicate: "email_callback_id = 'ecb1'", index: 'email_processings_email_callback_id_user_id_created_at_index' },
    { table: 'auth_sessions', predicate: "user_id = 'usr1'", index: 'auth_sessions_user_id_index' },
    { table: 'auth_accounts', predicate: "user_id = 'usr1'", index: 'auth_accounts_user_id_index' },
    { table: 'auth_accounts', predicate: "account_id = 'account1' AND provider_id = 'github'", index: 'auth_accounts_account_id_provider_id_index' },
    { table: 'email_processings', predicate: 'created_at < 1745107200000', index: 'email_processings_created_at_emailCallbackId_index' },
  ])('$table lookups on $predicate use $index', async ({ table, predicate, index }) => {
    const plan = await db.all<{ detail: string }>(sql.raw(`EXPLAIN QUERY PLAN SELECT * FROM ${table} WHERE ${predicate}`));

    expect(plan.some(({ detail }) => detail.includes(`SEARCH ${table} USING INDEX ${index}`))).toBe(true);
  });

  test('processing pagination filters by callback and user without a temporary sort', async () => {
    const query = db
      .select()
      .from(emailProcessingsTable)
      .where(and(eq(emailProcessingsTable.emailCallbackId, 'ecb1'), eq(emailProcessingsTable.userId, 'usr1')))
      .orderBy(desc(emailProcessingsTable.createdAt))
      .limit(20)
      .offset(20);

    const plan = await db.all<{ detail: string }>(sql`EXPLAIN QUERY PLAN ${query.getSQL()}`);
    const details = plan.map(({ detail }) => detail).join('\n');

    expect(details).toContain('USING INDEX email_processings_email_callback_id_user_id_created_at_index (email_callback_id=? AND user_id=?)');
    expect(details).not.toContain('USE TEMP B-TREE');
  });

  test('processing counts use the covering callback and user index', async () => {
    const query = db
      .select({ count: count() })
      .from(emailProcessingsTable)
      .where(and(eq(emailProcessingsTable.emailCallbackId, 'ecb1'), eq(emailProcessingsTable.userId, 'usr1')));

    const plan = await db.all<{ detail: string }>(sql`EXPLAIN QUERY PLAN ${query.getSQL()}`);

    expect(plan.some(({ detail }) => detail.includes('USING COVERING INDEX email_processings_email_callback_id_user_id_created_at_index (email_callback_id=? AND user_id=?)'))).toBe(true);
  });
});
