import type { Database } from './database.types';
import { D1Database, D1DatabaseAPI } from '@miniflare/d1';
import { createSQLiteDB } from '@miniflare/shared';

import { usersTable } from '../../users/users.table';
import { setupDatabase } from './database';
import { runMigrations } from './database.services';

export { createInMemoryDatabase, seedDatabase };

const seedTables = {
  users: usersTable,
} as const;

type SeedTables = {
  [K in keyof typeof seedTables]?: typeof seedTables[K] extends { $inferInsert: infer T } ? T[] : never;
};

async function createInMemoryDatabase(seedOptions: SeedTables | undefined = {}) {
  const sqliteDb = await createSQLiteDB(':memory:');
  const binding = new D1Database(new D1DatabaseAPI(sqliteDb));

  const { db } = setupDatabase({ binding });

  await runMigrations({ db });

  await seedDatabase({ db, ...seedOptions });

  return {
    db,
  };
}

async function seedDatabase({ db, ...seedRows }: { db: Database } & SeedTables) {
  await Promise.all(
    Object
      .entries(seedRows)
      .map(([table, rows]) => db
        .insert(seedTables[table as keyof typeof seedTables])
        .values(rows)
        .execute(),
      ),
  );
}
