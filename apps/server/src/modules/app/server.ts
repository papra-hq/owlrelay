import type { Config } from '../config/config.types';
import type { Auth } from './auth/auth.services';
import type { Database } from './database/database.types';
import type { ServerInstanceGenerics } from './server.types';
import { Hono } from 'hono';
import { secureHeaders } from 'hono/secure-headers';
import { parseConfig } from '../config/config';
import { loggerMiddleware } from '../shared/logger/logger.middleware';
import { getAuth } from './auth/auth.services';
import { setupDatabase } from './database/database';
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

  app.use((context, next) => {
    const config = overrideConfig ?? parseConfig({ env: context.env as Record<string, string | undefined> }).config;
    const db = overrideDb ?? setupDatabase({ binding: context.env.DB }).db;
    const auth = overrideAuth ?? getAuth({ db, config }).auth;

    context.set('config', config);
    context.set('db', db);
    context.set('auth', auth);

    return next();
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
