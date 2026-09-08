import type { Context } from '../server.types';
import type { EventsServices } from './events.services';

export type RegistrableEventHandler = (args: { eventsServices: EventsServices; context: Context }) => void | Promise<void>;

export function createRegistrableEventHandler(fn: RegistrableEventHandler) {
  return fn;
}

export function getEventsServices({ context }: { context: Context }) {
  const eventsServices = context.get('eventsServices');

  if (!eventsServices) {
    throw new Error('Events services middleware is not registered');
  }

  return { eventsServices };
}
