import type { Database } from '../app/database/database.types';
import type { DbInsertableEmailCallback } from './email-callbacks.types';
import { injectArguments, safely } from '@corentinth/chisels';
import { and, count, eq } from 'drizzle-orm';
import { pick } from 'lodash-es';
import { isUniqueConstraintError } from '../shared/db/constraints.models';
import { createError } from '../shared/errors/errors';
import { emailsCallbacksTable } from './email-callbacks.table';

export type EmailCallbacksRepository = ReturnType<typeof createEmailCallbacksRepository>;

export function createEmailCallbacksRepository({ db }: { db: Database }) {
  return injectArguments(
    {
      getUserEmailCallbacks,
      deleteUserEmailCallback,
      createUserEmailCallback,
      updateUserEmailCallback,
      getEmailCallbackByUsernameAndDomain,
      getUserEmailCallback,
      getUserEmailCallbacksCount,
    },
    { db },
  );
}

async function getUserEmailCallbacks({ userId, db }: { userId: string; db: Database }) {
  const emailCallbacks = await db
    .select()
    .from(emailsCallbacksTable)
    .where(
      eq(emailsCallbacksTable.userId, userId),
    );

  return { emailCallbacks };
}

async function deleteUserEmailCallback({ userId, emailCallbackId, db }: { userId: string; emailCallbackId: string; db: Database }) {
  await db.delete(emailsCallbacksTable).where(
    and(
      eq(emailsCallbacksTable.userId, userId),
      eq(emailsCallbacksTable.id, emailCallbackId),
    ),
  );
}

async function createUserEmailCallback({
  userId,
  emailCallback: emailCallbackToCreate,
  db,
}: { userId: string; emailCallback: DbInsertableEmailCallback; db: Database }) {
  const [emailCallbacks, error] = await safely(db
    .insert(emailsCallbacksTable)
    .values({
      ...emailCallbackToCreate,
      userId,
    })
    .returning(),
  );

  if (isUniqueConstraintError({ error })) {
    throw createError({
      message: 'Email callback already exists',
      code: 'email_callbacks.already_exists',
      statusCode: 400,
    });
  }

  if (error) {
    throw error;
  }

  const [emailCallback] = emailCallbacks ?? [];

  return { emailCallback };
}

async function updateUserEmailCallback({
  emailCallbackId,
  userId,
  emailCallback: emailCallbackToUpdate,
  db,
}: {
  emailCallbackId: string;
  userId: string;
  emailCallback: Partial<Pick<DbInsertableEmailCallback, 'domain' | 'username' | 'webhookUrl' | 'webhookSecret' | 'allowedOrigins' | 'isEnabled'>>;
  db: Database;
}) {
  const [emailCallback] = await db
    .update(emailsCallbacksTable)
    .set({
      ...pick(emailCallbackToUpdate, ['domain', 'username', 'webhookUrl', 'webhookSecret', 'allowedOrigins', 'isEnabled']),
    })
    .where(
      and(
        eq(emailsCallbacksTable.id, emailCallbackId),
        eq(emailsCallbacksTable.userId, userId),
      ),
    )
    .returning();

  return { emailCallback };
}

async function getEmailCallbackByUsernameAndDomain({ username, domain, db }: { username: string; domain: string; db: Database }) {
  const [emailCallback] = await db
    .select()
    .from(emailsCallbacksTable)
    .where(
      and(
        eq(emailsCallbacksTable.username, username),
        eq(emailsCallbacksTable.domain, domain),
      ),
    );

  return { emailCallback };
}

async function getUserEmailCallback({ userId, emailCallbackId, db }: { userId: string; emailCallbackId: string; db: Database }) {
  const [emailCallback] = await db
    .select()
    .from(emailsCallbacksTable)
    .where(
      and(
        eq(emailsCallbacksTable.id, emailCallbackId),
        eq(emailsCallbacksTable.userId, userId),
      ),
    );

  return { emailCallback };
}

async function getUserEmailCallbacksCount({ userId, db }: { userId: string; db: Database }) {
  const [{ count: emailCallbacksCount }] = await db
    .select({ count: count() })
    .from(emailsCallbacksTable)
    .where(
      eq(emailsCallbacksTable.userId, userId),
    );

  return { emailCallbacksCount };
}
