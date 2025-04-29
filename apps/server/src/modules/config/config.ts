import type { ConfigDefinition } from 'figue';
import { safelySync } from '@corentinth/chisels';
import { defineConfig } from 'figue';
import { z } from 'zod';
import { apiKeysConfig } from '../api-keys/api-keys.config';
import { authConfig } from '../app/auth/auth.config';
import { databaseConfig } from '../app/database/database.config';
import { emailCallbacksConfig } from '../email-callbacks/email-callbacks.config';
import { emailsConfig } from '../emails/emails.config';
import { createLogger } from '../shared/logger/logger';
import { trackingConfig } from '../tracking/tracking.config';

export const configDefinition = {
  env: {
    doc: 'The application environment.',
    schema: z.enum(['development', 'production', 'test']),
    default: 'development',
    env: 'NODE_ENV',
  },
  server: {
    baseUrl: {
      doc: 'The base URL of the server',
      schema: z.string().url(),
      default: 'http://localhost:1222',
      env: 'SERVER_BASE_URL',
    },
    routeTimeoutMs: {
      doc: 'The maximum time in milliseconds for a route to complete before timing out',
      schema: z.coerce.number().int().positive(),
      default: 20_000,
      env: 'SERVER_API_ROUTES_TIMEOUT_MS',
    },
    corsOrigins: {
      doc: 'The CORS origin for the api server',
      schema: z.union([
        z.string(),
        z.array(z.string()),
      ]).transform(value => (typeof value === 'string' ? value.split(',') : value)),
      default: ['http://localhost:3000'],
      env: 'SERVER_CORS_ORIGINS',
    },
  },
  client: {
    baseUrl: {
      doc: 'The URL of the client',
      schema: z.string().url(),
      default: 'http://localhost:3000',
      env: 'CLIENT_BASE_URL',
    },
    oauthRedirectUrl: {
      doc: 'The URL to redirect to after OAuth',
      schema: z.string().url(),
      default: 'http://localhost:3000/confirm',
      env: 'CLIENT_OAUTH_REDIRECT_URL',
    },
  },
  stripe: {
    apiSecretKey: {
      doc: 'The Stripe API secret key',
      default: 'change-me',
      schema: z.string(),
      env: 'STRIPE_API_SECRET_KEY',
    },
    webhookSecret: {
      doc: 'The Stripe webhook secret',
      schema: z.string(),
      default: 'change-me',
      env: 'STRIPE_WEBHOOK_SECRET',
    },
    plans: {
      proPlanPriceId: {
        doc: 'The price ID for the pro plan',
        schema: z.string(),
        default: 'change-me',
        env: 'STRIPE_PRO_PLAN_PRICE_ID',
      },
    },
  },
  database: databaseConfig,
  tracking: trackingConfig,
  emails: emailsConfig,
  auth: authConfig,
  emailCallbacks: emailCallbacksConfig,
  apiKeys: apiKeysConfig,
} as const satisfies ConfigDefinition;

const logger = createLogger({ namespace: 'config' });

export function parseConfig({ env }: { env?: Record<string, string | undefined> } = {}) {
  const [configResult, configError] = safelySync(() => defineConfig(
    configDefinition,
    {
      envSource: env,
    },
  ));

  if (configError) {
    logger.error({ error: configError }, `Invalid config: ${configError.message}`);
    throw new Error(configError.message);
  }

  const { config } = configResult;

  return { config };
}
