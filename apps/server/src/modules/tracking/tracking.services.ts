import type { Config } from '../config/config.types';
import type { Defer } from '../shared/defer';
import type { PostHogClient } from './posthog';
import { injectArguments } from '@corentinth/chisels';
import { createPostHogClient } from './posthog';

export type TrackingServices = ReturnType<typeof createTrackingServices>;

export function createTrackingServices({ config, defer }: { config: Config; defer: Defer }) {
  const { postHogClient } = createPostHogClient({
    apiKey: config.tracking.posthog.apiKey,
    host: config.tracking.posthog.host,
    isEnabled: config.tracking.posthog.isEnabled,
  });

  return injectArguments(
    {
      captureEvent,
      flushAndShutdown,
    },
    {
      postHogClient,
      defer,
    },
  );
}

function captureEvent({
  userId,
  event,
  properties,
  postHogClient,
}: {
  userId: string;
  event: string;
  properties?: Record<string, unknown>;
  postHogClient: PostHogClient;
}) {
  postHogClient.capture({
    distinctId: userId,
    event,
    properties,
  });
}

function flushAndShutdown({ postHogClient, defer }: { postHogClient: PostHogClient; defer: Defer }) {
  defer(postHogClient.shutdown());
}
