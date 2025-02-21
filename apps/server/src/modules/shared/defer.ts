import type { Logger } from '@crowlog/logger';
import type { Context } from '../app/server.types';
import { safely } from '@corentinth/chisels';
import { createLogger } from '@crowlog/logger';
import { getRuntimeKey } from 'hono/adapter';

export type Defer = (fn: (() => Promise<unknown>) | Promise<unknown>) => void;

export function createDefer({ context, logger = createLogger({ namespace: 'defer' }) }: { context: Context; logger?: Logger }): { defer: Defer } {
  return {
    defer: async (fn) => {
      const handler = async () => {
        const [, error] = await safely(fn instanceof Promise ? fn : fn());

        if (error) {
          logger.error({ error }, 'Error in deferred function');
        }
      };

      const promise = handler();

      if (getRuntimeKey() === 'workerd') {
        context.executionCtx.waitUntil(promise);
      } else {
        setImmediate(async () => {
          await promise;
        });
      }
    },
  };
}

export function createDeferrableFactory({
  context,
  logger = createLogger({ namespace: 'defer' }),
}: {
  context: Context;
  logger?: Logger;
}) {
  const { defer } = createDefer({ context, logger });

  return {
    makeDeferrable: <T>(fn: (args: T) => Promise<unknown>) => (args: T) => defer(fn(args)),
  };
}
