import type { Config } from '../config/config.types';
import type { Auth } from './auth/auth.services';
import type { Database } from './database/database.types';
import type { ServerInstanceGenerics } from './server.types';
import { Hono } from 'hono';
import { secureHeaders } from 'hono/secure-headers';
import { parseConfig } from '../config/config';
import { createEmailsServices } from '../emails/emails.services';
import { createDefer } from '../shared/defer';
import { loggerMiddleware } from '../shared/logger/logger.middleware';
import { createTrackingServices } from '../tracking/tracking.services';
import { createAuthEmailsServices } from './auth/auth.emails.services';
import { getAuth } from './auth/auth.services';
import { setupDatabase } from './database/database';
import { createEventsServices } from './events/events.services';
import { corsMiddleware } from './middlewares/cors.middleware';
import { registerErrorMiddleware } from './middlewares/errors.middleware';
import { timeoutMiddleware } from './middlewares/timeout.middleware';
import { registerRoutes } from './server.routes';

export function createServer({
  db: overrideDb,
  config: overrideConfig,
  auth: overrideAuth,
}: {
  db?: Database;
  config?: Config;
  auth?: Auth;
} = {}) {
  const app = new Hono<ServerInstanceGenerics>({ strict: true });

  app.use(loggerMiddleware);

  app.use(async (context, next) => {
    const config = overrideConfig ?? parseConfig({ env: context.env as Record<string, string | undefined> }).config;
    const db = overrideDb ?? setupDatabase(config.database).db;
    const { defer } = createDefer({ context });

    const trackingServices = createTrackingServices({ config, defer });
    context.set('trackingServices', trackingServices);

    const emailsServices = createEmailsServices({ config });
    const authEmailsServices = createAuthEmailsServices({ emailsServices });
    const eventsServices = createEventsServices({ context });

    const auth = overrideAuth ?? getAuth({ db, config, authEmailsServices, eventsServices }).auth;

    context.set('trackingServices', trackingServices);
    context.set('config', config);
    context.set('db', db);
    context.set('auth', auth);
    context.set('eventsServices', eventsServices);

    await next();

    trackingServices.flushAndShutdown();
  });

  app.use(corsMiddleware);
  app.use(timeoutMiddleware);
  app.use(secureHeaders());

  registerErrorMiddleware({ app });
  registerRoutes({ app });

  return {
    app,
  };
}
