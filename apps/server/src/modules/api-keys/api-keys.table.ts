import { index, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { createPrimaryKeyField, createTimestampColumns } from '../shared/db/columns.helpers';
import { usersTable } from '../users/users.table';
import { generateApiToken } from './api-keys.services';

export const apiKeysTable = sqliteTable(
  'api_keys',
  {
    ...createPrimaryKeyField({ prefix: 'ak' }),
    ...createTimestampColumns(),

    name: text('name').notNull(),
    token: text('token').notNull().unique().$defaultFn(generateApiToken),
    userId: text('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),

  },
  table => [
    // To get an API key by its token
    index('token_index').on(table.token),
  ],
);
