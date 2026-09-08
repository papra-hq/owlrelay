import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { emailsCallbacksTable } from '../email-callbacks/email-callbacks.table';
import { createPrimaryKeyField, createTimestampColumns } from '../shared/db/columns.helpers';
import { usersTable } from '../users/users.table';

export const emailProcessingsTable = sqliteTable(
  'email_processings',
  {
    ...createPrimaryKeyField({ prefix: 'ep' }),
    ...createTimestampColumns(),

    emailCallbackId: text('email_callback_id')
      .notNull()
      .references(() => emailsCallbacksTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    status: text('status').notNull(),
    error: text('error'),

    fromAddress: text('from_address').notNull(),
    subject: text('subject').notNull(),

    webhookUrl: text('webhook_url'),
    webhookResponseStatusCode: integer('webhook_response_status_code'),
  },

  table => [
    // Keep a date-first index for retention cleanup across callbacks.
    index('email_processings_created_at_emailCallbackId_index').on(table.createdAt, table.emailCallbackId),
    // Equality filters precede the sort column for pagination and counts.
    // The callback prefix also supports cascading callback deletions.
    index('email_processings_email_callback_id_user_id_created_at_index').on(table.emailCallbackId, table.userId, table.createdAt),
    index('email_processings_user_id_index').on(table.userId),
  ],
);
