import type { Context } from '../server.types';
import { createDeferrableFactory } from '../../shared/defer';
import { createHook } from '../../shared/hooks/hooks';
import { eventsHandlers } from './events.handlers';

export type EventsServices = ReturnType<typeof createEventsServices>;

export function createEventsServices({ context }: { context: Context }) {
  const { makeDeferrable } = createDeferrableFactory({ context });
  const { on: defineOnUserCreatedEventHandler, trigger: triggerUserCreatedEvent } = createHook<{ userId: string }>();
  const { on: defineOnEmailCallbackCreatedEventHandler, trigger: triggerEmailCallbackCreatedEvent } = createHook<{ emailCallbackId: string; userId: string }>();
  const { on: defineOnApiKeyCreatedEventHandler, trigger: triggerApiKeyCreatedEvent } = createHook<{ apiKeyId: string; userId: string }>();

  const eventsServices = {
    defineOnUserCreatedEventHandler,
    triggerUserCreatedEvent: makeDeferrable(triggerUserCreatedEvent),
    defineOnEmailCallbackCreatedEventHandler,
    triggerEmailCallbackCreatedEvent: makeDeferrable(triggerEmailCallbackCreatedEvent),
    defineOnApiKeyCreatedEventHandler,
    triggerApiKeyCreatedEvent: makeDeferrable(triggerApiKeyCreatedEvent),
  };

  for (const handler of eventsHandlers) {
    handler({ eventsServices, context });
  }

  return eventsServices;
}
