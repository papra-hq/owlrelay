import { describe, expect, test } from 'vitest';
import { createHook } from './hooks';

function createHandler() {
  const args: unknown[] = [];

  return {
    handler: (arg: unknown) => {
      args.push(arg);
    },
    getArgs: () => args,
  };
}

describe('hooks', () => {
  describe('createHook', () => {
    describe('hook.trigger', () => {
      test(`the trigger method must return a promise that resolves when all handlers have been called, 
            it is used to tell workers to wait for any async operations to complete after routes handler have been processed`, async () => {
        const hook = createHook<{ data: string }>();

        const handler1 = createHandler();
        const handler2 = createHandler();

        hook.on({ name: 'handler1', handler: handler1.handler });
        hook.on({ name: 'handler2', handler: handler2.handler });

        await hook.trigger({ data: 'hello' });

        expect(handler1.getArgs()).toEqual([{ data: 'hello' }]);
        expect(handler2.getArgs()).toEqual([{ data: 'hello' }]);
      });

      test('when a handler throws an error, it must not prevent other handlers from being executed', async () => {
        const hook = createHook<{ data: string }>();

        const handler2 = createHandler();

        hook.on({
          name: 'handler1',
          handler: () => {
            throw new Error('handler1 error');
          },
        });

        hook.on({ name: 'handler2', handler: handler2.handler });

        await hook.trigger({ data: 'hello' });

        expect(handler2.getArgs()).toEqual([
          {
            data: 'hello',

          },
        ]);
      });
    });
  });
});
