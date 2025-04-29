import type { Database } from '../app/database/database.types';
import type { DbInsertableEmailProcessing } from './email-processings.types';
import { injectArguments } from '@corentinth/chisels';
import { subDays } from 'date-fns';
import { and, count, desc, eq, inArray, lt, or } from 'drizzle-orm';
import { PLANS } from '../plans/plans.constants';
import { withPagination } from '../shared/db/pagination';
import { usersTable } from '../users/users.table';
import { emailProcessingsTable } from './email-processings.table';

export type EmailProcessingsRepository = ReturnType<typeof createEmailProcessingsRepository>;

export function createEmailProcessingsRepository({ db }: { db: Database }) {
  return injectArguments(
    {
      createEmailProcessing,
      getEmailProcessings,
      countEmailProcessings,
      deleteOutdatedEmailProcessings,
    },
    { db },
  );
}

async function createEmailProcessing({ emailProcessing: emailProcessingToCreate, db }: { emailProcessing: DbInsertableEmailProcessing; db: Database }) {
  const [emailProcessing] = await db.insert(emailProcessingsTable).values(emailProcessingToCreate).returning();

  return { emailProcessing };
}

async function getEmailProcessings({ emailCallbackId, userId, pageIndex, pageSize, db }: { emailCallbackId: string; userId: string; pageIndex: number; pageSize: number; db: Database }) {
  const query = db
    .select()
    .from(emailProcessingsTable)
    .where(
      and(
        eq(emailProcessingsTable.emailCallbackId, emailCallbackId),
        eq(emailProcessingsTable.userId, userId),
      ),
    );

  const emailProcessings = await withPagination(
    query.$dynamic(),
    {
      orderByColumn: desc(emailProcessingsTable.createdAt),
      pageIndex,
      pageSize,
    },
  );

  return { emailProcessings };
}

async function countEmailProcessings({ emailCallbackId, userId, db }: { emailCallbackId: string; userId: string; db: Database }) {
  const [{ count: emailProcessingsCount }] = await db
    .select({ count: count() })
    .from(emailProcessingsTable)
    .where(
      and(
        eq(emailProcessingsTable.emailCallbackId, emailCallbackId),
        eq(emailProcessingsTable.userId, userId),
      ),
    );

  return { emailProcessingsCount };
}

async function deleteOutdatedEmailProcessings({ db, now = new Date() }: { now?: Date; db: Database }) {
  const isOutdatedForPlan = ({ id, maxProcessingRetentionDays }: { id: string; maxProcessingRetentionDays: number }) =>
    and(
      lt(emailProcessingsTable.createdAt, subDays(now, maxProcessingRetentionDays)),
      eq(usersTable.planId, id),
    );

  const processingsToDelete = await db
    .select({ id: emailProcessingsTable.id })
    .from(emailProcessingsTable)
    .leftJoin(usersTable, eq(emailProcessingsTable.userId, usersTable.id))
    .where(
      or(
        isOutdatedForPlan(PLANS.FREE),
        isOutdatedForPlan(PLANS.PRO),
      ),
    );

  if (processingsToDelete.length === 0) {
    return {
      deletedProcessingCount: 0,
    };
  }

  const processingIdsToDelete = processingsToDelete.map(({ id }) => id);

  await db
    .delete(emailProcessingsTable)
    .where(
      inArray(emailProcessingsTable.id, processingIdsToDelete),
    );

  return {
    deletedProcessingCount: processingIdsToDelete.length,
  };
}
