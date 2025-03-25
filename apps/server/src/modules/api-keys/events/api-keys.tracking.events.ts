import { createRegistrableEventHandler } from '../../app/events/events.models';
import { getTrackingServices } from '../../tracking/tracking.models';

export const registerApiKeyCreatedTrackingEvent = createRegistrableEventHandler(({ eventsServices, context }) => {
  const { defineOnApiKeyCreatedEventHandler } = eventsServices;
  const { trackingServices } = getTrackingServices({ context });

  defineOnApiKeyCreatedEventHandler({
    name: 'api-key-created.tracking',
    handler: async ({ userId }) => {
      trackingServices.captureEvent({ userId, event: 'Api key created' });
    },
  });
});
