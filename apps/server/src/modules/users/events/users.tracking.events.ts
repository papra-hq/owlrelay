import { createRegistrableEventHandler } from '../../app/events/events.models';
import { getTrackingServices } from '../../tracking/tracking.models';

export const registerUserCreatedTrackingEvent = createRegistrableEventHandler(({ eventsServices, context }) => {
  const { defineOnUserCreatedEventHandler } = eventsServices;
  const { trackingServices } = getTrackingServices({ context });

  defineOnUserCreatedEventHandler({
    name: 'user-created.tracking',
    handler: async ({ userId }) => {
      trackingServices.captureEvent({ userId, event: 'User signed up' });
    },
  });
});
