import type { Context } from '../server.types';
import type { EventsServices } from './events.services';

export function createRegistrableEventHandler(fn: (args: {
  eventsServices: EventsServices;
  context: Context;
}) => void | Promise<void>) {
  return fn;
}

export function getEventsServices({ context }: { context: Context }) {
  const eventsServices = context.get('eventsServices');

  if (!eventsServices) {
    throw new Error('Events services middleware is not registered');
  }

  return { eventsServices };
}
