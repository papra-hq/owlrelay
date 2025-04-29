import { setupDatabase } from '../app/database/database';
import { parseConfig } from '../config/config';
import { createLogger } from '../shared/logger/logger';
import { dailyCronDefinition } from './tasks/daily.tasks';

const logger = createLogger({ namespace: 'cron' });

const tasks = {
  ...dailyCronDefinition,
};

export async function triggerCron({ cron }: { cron: string }, env: Record<string, string>) {
  const { config } = parseConfig({ env });
  const { db } = setupDatabase({ ...config.database });

  const task = tasks[cron];

  if (!task) {
    logger.error({ cron }, 'No task found for cron');
    return;
  }

  await task({ db, config });
}
