import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { createPrimaryKeyField, createTimestampColumns } from '../shared/db/columns.helpers';
import { usersTable } from '../users/users.table';

export const apiKeysTable = sqliteTable(
  'api_keys',
  {
    ...createPrimaryKeyField({ prefix: 'ak' }),
    ...createTimestampColumns(),

    name: text('name').notNull(),
    keyHash: text('key_hash').notNull().unique(),
    prefix: text('prefix').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  },
);
