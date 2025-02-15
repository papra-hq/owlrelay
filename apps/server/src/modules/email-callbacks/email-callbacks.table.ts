import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { createPrimaryKeyField, createTimestampColumns } from '../shared/db/columns.helpers';
import { usersTable } from '../users/users.table';
import { emailCallbackIdPrefix } from './email-callbacks.constants';

export const emailsCallbacksTable = sqliteTable(
  'emails_callbacks',
  {
    ...createPrimaryKeyField({ prefix: emailCallbackIdPrefix }),
    ...createTimestampColumns(),

    isEnabled: integer('is_enabled', { mode: 'boolean' }).notNull().default(true),
    userId: text('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),

    domain: text('domain').notNull(),
    username: text('username').notNull().unique(),
    allowedOrigins: text('allowed_origins', { mode: 'json' }).$type<string[]>().notNull().default([]),

    webhookUrl: text('webhook_url').notNull(),
    webhookSecret: text('webhook_secret').notNull(),
  },
  table => [
    uniqueIndex('emails_callbacks_domain_username_index').on(table.domain, table.username),
  ],
);
