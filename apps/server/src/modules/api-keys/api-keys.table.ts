import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { createPrimaryKeyField, createTimestampColumns } from '../shared/db/columns.helpers';
import { usersTable } from '../users/users.table';

export const apiKeysTable = sqliteTable(
  'api_keys',
  {
    ...createPrimaryKeyField({ prefix: 'ak' }),
    ...createTimestampColumns(),

    name: text('name').notNull(),
    // Legacy, will be removed in a future migration
    token: text('token'),
    keyHash: text('key_hash'), // TODO: mark as not null and unique in a future migration
    prefix: text('prefix'), // TODO: mark as not null in a future migration
    userId: text('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  },
);
