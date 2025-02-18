import type { ServerInstance } from './server.types';
import { registerConfigPublicRoutes } from '../config/config.routes';
import { registerEmailCallbacksPrivateRoutes } from '../email-callbacks/email-callbacks.routes';
import { registerPrivatePaymentsRoutes, registerPublicPaymentsRoutes } from '../payments/payments.routes';
import { registerUsersPrivateRoutes } from '../users/users.routes';
import { createUnauthorizedError } from './auth/auth.errors';
import { getSession } from './auth/auth.models';
import { registerAuthRoutes } from './auth/auth.routes';
import { registerHealthCheckRoutes } from './health-check/health-check.routes';

export function registerRoutes({ app }: { app: ServerInstance }) {
  registerAuthRoutes({ app });

  registerPublicRoutes({ app });
  registerPrivateRoutes({ app });
}

function registerPublicRoutes({ app }: { app: ServerInstance }) {
  registerConfigPublicRoutes({ app });
  registerHealthCheckRoutes({ app });
  registerPublicPaymentsRoutes({ app });
}

function registerPrivateRoutes({ app }: { app: ServerInstance }) {
  app.use(async (context, next) => {
    const { session } = getSession({ context });

    if (!session) {
      throw createUnauthorizedError();
    }

    await next();
  });

  registerUsersPrivateRoutes({ app });
  registerEmailCallbacksPrivateRoutes({ app });
  registerPrivatePaymentsRoutes({ app });
}
