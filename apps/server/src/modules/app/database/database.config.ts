import type { ConfigDefinition } from 'figue';
import { z } from 'zod';

export const databaseConfig = {
  d1BindingName: {
    doc: 'The Cloudflare D1 database binding name',
    schema: z.string(),
    default: 'DB',
    env: 'DATABASE_D1_BINDING_NAME',
  },
} as const satisfies ConfigDefinition;
