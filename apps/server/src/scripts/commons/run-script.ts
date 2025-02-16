import type { Database } from '../../modules/app/database/database.types';
import type { Config } from '../../modules/config/config.types';
import type { Logger } from '../../modules/shared/logger/logger';
import process from 'node:process';
import { parse } from '@bomb.sh/args';
import { setupDatabase } from '../../modules/app/database/database';
import { parseConfig } from '../../modules/config/config';
import { createLogger, wrapWithLoggerContext } from '../../modules/shared/logger/logger';

export { runScript };

async function runScript(
  { scriptName }: { scriptName: string },
  fn: (args: { logger: Logger; db: Database; config: Config; processArgs: Record<string, unknown> }) => Promise<void> | void,
) {
  const argv = process.argv.slice(2);
  const processArgs = parse(argv);

  wrapWithLoggerContext(
    {
      scriptName,
    },
    async () => {
      const logger = createLogger({ namespace: 'scripts' });

      const { config } = parseConfig({ env: process.env });
      const { db, client } = setupDatabase({ ...config.database });

      try {
        logger.info('Script started');
        await fn({ logger, db, config, processArgs });
        logger.info('Script finished');
      } catch (error) {
        logger.error({ error }, 'Script failed');
        process.exit(1);
      } finally {
        client.close();
      }
    },
  );
}
