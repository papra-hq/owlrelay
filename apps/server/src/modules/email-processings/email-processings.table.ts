import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { emailsCallbacksTable } from '../email-callbacks/email-callbacks.table';
import { createPrimaryKeyField, createTimestampColumns } from '../shared/db/columns.helpers';
import { usersTable } from '../users/users.table';

export const emailProcessingsTable = sqliteTable(
  'email_processings',
  {
    ...createPrimaryKeyField({ prefix: 'ep' }),
    ...createTimestampColumns(),

    emailCallbackId: text('email_callback_id').notNull().references(() => emailsCallbacksTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    userId: text('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    status: text('status').notNull(),
    error: text('error'),

    fromAddress: text('from_address').notNull(),
    subject: text('subject').notNull(),

    webhookUrl: text('webhook_url'),
    webhookResponseStatusCode: integer('webhook_response_status_code'),
  },

  table => [
    // pagination search index
    index('email_processings_created_at_emailCallbackId_index').on(table.createdAt, table.emailCallbackId),
  ],
);
