import type { Database } from '../app/database/database.types';
import type { Config } from '../config/config.types';
import { safely } from '@corentinth/chisels';
import { createLogger } from '../shared/logger/logger';

type CronJob = ({ config, db }: { config: Config; db: Database }) => Promise<void>;

const logger = createLogger({ namespace: 'cron' });

export function defineCronTasks({ cron, tasks }: { cron: string; tasks: { name: string; handler: CronJob }[] }) {
  const task: CronJob = async ({ config, db }) => {
    for (const { handler, name } of tasks) {
      logger.info({ cron, taskName: name }, 'Running cron task');
      const startTime = Date.now();

      const [, error] = await safely(handler({ config, db }));

      const duration = Date.now() - startTime;

      if (error) {
        logger.error({ cron, taskName: name, error }, 'Failed to run cron task');
        return;
      }

      logger.info({ cron, taskName: name, duration }, 'Cron task completed');
    }
  };

  return {
    [cron]: task,
  };
}
