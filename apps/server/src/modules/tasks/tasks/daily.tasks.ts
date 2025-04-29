import { createEmailProcessingsRepository } from '../../email-processings/email-processings.repository';
import { createLogger } from '../../shared/logger/logger';
import { defineCronTasks } from '../tasks.models';

const logger = createLogger({ namespace: 'daily-tasks' });

export const dailyCronDefinition = defineCronTasks({
  cron: '38 4 * * *',
  tasks: [
    {
      name: 'Remove outdated email processings',
      handler: async ({ db }) => {
        const emailProcessingsRepository = createEmailProcessingsRepository({ db });

        const { deletedProcessingCount } = await emailProcessingsRepository.deleteOutdatedEmailProcessings();

        logger.info({ deletedProcessingCount }, 'Removed outdated email processings');
      },
    },
  ],
});
