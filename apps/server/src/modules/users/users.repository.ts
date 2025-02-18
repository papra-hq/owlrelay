import type { Database } from '../app/database/database.types';
import { injectArguments } from '@corentinth/chisels';
import { eq } from 'drizzle-orm';
import { createUsersNotFoundError } from './users.errors';
import { usersTable } from './users.table';

export { createUsersRepository };

export type UsersRepository = ReturnType<typeof createUsersRepository>;

function createUsersRepository({ db }: { db: Database }) {
  return injectArguments(
    {
      getUserByEmail,
      getUserById,
      getUserByIdOrThrow,
      updateUser,
      saveUserPlanId,
      saveUserCustomerId,
    },
    { db },
  );
}

async function getUserByEmail({ email, db }: { email: string; db: Database }) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));

  if (!user) {
    return { user: undefined };
  }

  return { user };
}

async function getUserById({ userId, db }: { userId: string; db: Database }) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));

  if (!user) {
    return { user: undefined };
  }

  return { user };
}

async function getUserByIdOrThrow({ userId, db, errorFactory = createUsersNotFoundError }: { userId: string; db: Database; errorFactory?: () => Error }) {
  const { user } = await getUserById({ userId, db });

  if (!user) {
    throw errorFactory();
  }

  return { user };
}

async function updateUser({ userId, name, db }: { userId: string; name: string; db: Database }) {
  const [user] = await db.update(usersTable).set({ name }).where(eq(usersTable.id, userId)).returning();

  return { user };
}

async function saveUserPlanId({ customerId, planId, db }: { customerId: string; planId: string; db: Database }) {
  const [user] = await db
    .update(usersTable)
    .set({ planId })
    .where(
      eq(usersTable.customerId, customerId),
    )
    .returning();

  return { user };
}

async function saveUserCustomerId({ customerId, userId, db }: { customerId: string; userId: string; db: Database }) {
  const [user] = await db
    .update(usersTable)
    .set({ customerId })
    .where(eq(usersTable.id, userId))
    .returning();

  return { user };
}
