import { registerApiKeyCreatedTrackingEvent } from '../../api-keys/events/api-keys.tracking.events';
import { registerEmailCallbackCreatedTrackingEvent } from '../../email-callbacks/events/email-callbacks.tracking.events';
import { registerUserCreatedTrackingEvent } from '../../users/events/users.tracking.events';

export const eventsHandlers = [
  registerUserCreatedTrackingEvent,
  registerEmailCallbackCreatedTrackingEvent,
  registerApiKeyCreatedTrackingEvent,
];
