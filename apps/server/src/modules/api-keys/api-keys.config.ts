import type { ConfigDefinition } from 'figue';
import { z } from 'zod';

export const apiKeysConfig = {
  maxApiKeysPerUser: {
    doc: 'The maximum number of API keys a user can have',
    schema: z.number().int().positive().min(1),
    default: 50,
    env: 'MAX_API_KEYS_PER_USER',
  },
} as const satisfies ConfigDefinition;
