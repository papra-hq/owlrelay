import type { emailProcessingsTable } from './email-processings.table';

export type EmailProcessing = typeof emailProcessingsTable.$inferSelect;
export type DbInsertableEmailProcessing = typeof emailProcessingsTable.$inferInsert;
