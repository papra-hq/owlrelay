import type { ConfigDefinition } from 'figue';
import { z } from 'zod';

export const emailCallbacksConfig = {
  availableDomains: {
    doc: 'The domains that can be used for email callbacks',
    schema: z.union([
      z.string(),
      z.array(z.string()),
    ]).transform(value => (typeof value === 'string' ? value.split(',') : value)),
    default: [
      'callback.email',
      'clb.email',
    ],
    env: 'EMAIL_CALLBACKS_AVAILABLE_DOMAINS',
  },
} as const satisfies ConfigDefinition;
