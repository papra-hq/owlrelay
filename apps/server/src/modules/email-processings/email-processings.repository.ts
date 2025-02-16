import type { Database } from '../app/database/database.types';
import type { DbInsertableEmailProcessing } from './email-processings.types';
import { injectArguments } from '@corentinth/chisels';
import { and, count, desc, eq } from 'drizzle-orm';
import { withPagination } from '../shared/db/pagination';
import { emailProcessingsTable } from './email-processings.table';

export type EmailProcessingsRepository = ReturnType<typeof createEmailProcessingsRepository>;

export function createEmailProcessingsRepository({ db }: { db: Database }) {
  return injectArguments(
    {
      createEmailProcessing,
      getEmailProcessings,
      countEmailProcessings,
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
