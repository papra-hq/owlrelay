import type { Logger } from '../../shared/logger/logger';
import { createLogger } from '../../shared/logger/logger';

export { createHook };

function createHook<T = any>({
  logger = createLogger({ namespace: 'events' }),
}: {
  logger?: Logger;
} = {}) {
  const callbacks: { name: string; handler: (args: T) => void }[] = [];

  return {
    on: ({ name, handler }: { name: string; handler: (args: T) => void }) => {
      if (callbacks.some(({ name: callbackName }) => callbackName === name)) {
        logger.info(`Hook "${name}" is already registered`);

        throw new Error(`Hook "${name}" is already registered`);
      }

      callbacks.push({ name, handler });
    },

    trigger: async (args: T): Promise<void> => {
      await Promise.all(
        callbacks.map(({ name, handler }) => {
          try {
            return handler(args);
          } catch (error) {
            logger.error({ error }, `Error in hook "${name}"`);
            return undefined;
          }
        }),
      );
    },
  };
}
