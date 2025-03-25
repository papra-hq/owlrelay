import { createRegistrableEventHandler } from '../../app/events/events.models';
import { getTrackingServices } from '../../tracking/tracking.models';

export const registerEmailCallbackCreatedTrackingEvent = createRegistrableEventHandler(({ eventsServices, context }) => {
  const { defineOnEmailCallbackCreatedEventHandler } = eventsServices;
  const { trackingServices } = getTrackingServices({ context });

  defineOnEmailCallbackCreatedEventHandler({
    name: 'email-callback-created.tracking',
    handler: async ({ userId }) => {
      trackingServices.captureEvent({ userId, event: 'Email callback created' });
    },
  });
});
