import { PostHog } from 'posthog-node';
import { createLogger } from '../shared/logger/logger';

const logger = createLogger({ namespace: 'tracking' });

export type PostHogClient = {
  capture: (args: {
    distinctId: string;
    event: string;
    properties?: Record<string, unknown>;
  }) => void;

  shutdown: () => Promise<void>;
};

export function createPostHogClient({
  apiKey,
  host,
  isEnabled,
}: {
  apiKey: string;
  host: string;
  isEnabled: boolean;
}): { postHogClient: PostHogClient } {
  if (!isEnabled) {
    return {
      postHogClient: {
        capture: ({ distinctId, event, properties }) => {
          logger.info({ distinctId, event, properties }, 'Tracking event captured');
        },
        shutdown: () => Promise.resolve(),
      },
    };
  }

  const postHogClient = new PostHog(
    apiKey,
    {
      host,
      disableGeoip: true,
      flushAt: 1,
      flushInterval: 0,
    },
  );

  return {
    postHogClient,
  };
}
