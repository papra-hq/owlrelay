import type { Database } from './database.types';
import { apiKeysTable } from '../../api-keys/api-keys.table';
import { emailsCallbacksTable } from '../../email-callbacks/email-callbacks.table';
import { emailProcessingsTable } from '../../email-processings/email-processings.table';
import { usersTable } from '../../users/users.table';
import { setupDatabase } from './database';
import { runMigrations } from './database.services';

export { createInMemoryDatabase, seedDatabase };

const seedTables = {
  users: usersTable,
  emailsCallbacks: emailsCallbacksTable,
  emailProcessings: emailProcessingsTable,
  apiKeys: apiKeysTable,
} as const;

type SeedTables = {
  [K in keyof typeof seedTables]?: typeof seedTables[K] extends { $inferInsert: infer T } ? T[] : never;
};

async function createInMemoryDatabase(seedOptions: SeedTables | undefined = {}) {
  const { db } = setupDatabase({ url: ':memory:' });

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
