import type { emailsCallbacksTable } from './email-callbacks.table';

export type EmailCallback = typeof emailsCallbacksTable.$inferSelect;
export type DbInsertableEmailCallback = typeof emailsCallbacksTable.$inferInsert;
