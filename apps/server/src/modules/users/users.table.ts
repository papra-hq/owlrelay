import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { PLANS } from '../plans/plans.constants';
import { createPrimaryKeyField, createTimestampColumns } from '../shared/db/columns.helpers';

export const usersTable = sqliteTable(
  'users',
  {
    ...createPrimaryKeyField({ prefix: 'usr' }),
    ...createTimestampColumns(),

    email: text('email').notNull().unique(),
    emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
    name: text('name'),
    image: text('image'),
    customerId: text('customer_id').unique(),
    planId: text('plan_id').notNull().default(PLANS.FREE.id),
  },
  table => [
    index('users_email_index').on(table.email),
  ],
);
