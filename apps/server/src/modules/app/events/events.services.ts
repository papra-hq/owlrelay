import type { Context } from '../server.types';
import { createDeferrableFactory } from '../../shared/defer';
import { createHook } from '../../shared/hooks/hooks';
import { eventsHandlers } from './events.handlers';

export type EventsServices = ReturnType<typeof createEventsServices>;

export function createEventsServices({ context }: { context: Context }) {
  const { makeDeferrable } = createDeferrableFactory({ context });
  const { on: defineOnUserCreatedEventHandler, trigger: triggerUserCreatedEvent } = createHook<{ userId: string }>();

  const eventsServices = {
    defineOnUserCreatedEventHandler,
    triggerUserCreatedEvent: makeDeferrable(triggerUserCreatedEvent),
  };

  for (const handler of eventsHandlers) {
    handler({ eventsServices, context });
  }

  return eventsServices;
}
