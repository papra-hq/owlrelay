import type { ServerInstance, ServerInstanceGenerics } from './server.types';
import { Hono } from 'hono';
import { apiKeyMiddleware } from '../api-keys/api-keys.middleware';
import { registerApiKeysPrivateRoutes } from '../api-keys/api-keys.routes';
import { registerConfigPublicRoutes } from '../config/config.routes';
import { registerEmailCallbacksPrivateRoutes } from '../email-callbacks/email-callbacks.routes';
import { registerPrivatePaymentsRoutes, registerPublicPaymentsRoutes } from '../payments/payments.routes';
import { registerUsersPrivateRoutes } from '../users/users.routes';
import { userAuthMiddleware } from './auth/auth.middleware';
import { registerAuthRoutes } from './auth/auth.routes';
import { registerHealthCheckRoutes } from './health-check/health-check.routes';

export function registerRoutes({ app }: { app: ServerInstance }) {
  registerAuthRoutes({ app });

  registerPublicRoutes({ app });
  registerApiPrivateRoutes({ app });
  registerPrivateRoutes({ app });
}

function registerPublicRoutes({ app }: { app: ServerInstance }) {
  registerConfigPublicRoutes({ app });
  registerHealthCheckRoutes({ app });
  registerPublicPaymentsRoutes({ app });
}

function registerApiPrivateRoutes({ app: rootApp }: { app: ServerInstance }) {
  const app = new Hono<ServerInstanceGenerics>();
  app.use(apiKeyMiddleware);

  registerEmailCallbacksPrivateRoutes({ app });

  rootApp.route('/', app);
}

function registerPrivateRoutes({ app: rootApp }: { app: ServerInstance }) {
  const app = new Hono<ServerInstanceGenerics>();
  app.use(userAuthMiddleware);

  registerUsersPrivateRoutes({ app });
  registerPrivatePaymentsRoutes({ app });
  registerApiKeysPrivateRoutes({ app });

  rootApp.route('/', app);
}
