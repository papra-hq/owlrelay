import type { ConfigDefinition } from 'figue';
import { z } from 'zod';

export const trackingConfig = {
  posthog: {
    isEnabled: {
      doc: 'Whether to enable PostHog',
      schema: z
        .string()
        .trim()
        .toLowerCase()
        .transform(x => x === 'true')
        .pipe(z.boolean()),
      default: 'false',
      env: 'POSTHOG_ENABLED',
    },
    apiKey: {
      doc: 'The API key for PostHog',
      schema: z.string(),
      default: 'set-me',
      env: 'POSTHOG_API_KEY',
    },
    host: {
      doc: 'The host for PostHog',
      schema: z.url(),
      default: 'https://eu.i.posthog.com',
      env: 'POSTHOG_HOST',
    },
  },
} as const satisfies ConfigDefinition;
