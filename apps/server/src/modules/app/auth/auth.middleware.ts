import type { Context } from '../server.types';
import { createMiddleware } from 'hono/factory';
import { createUnauthorizedError } from './auth.errors';
import { getSession } from './auth.models';

export const userAuthMiddleware = createMiddleware(async (context: Context, next) => {
  const { session } = getSession({ context });

  if (!session) {
    throw createUnauthorizedError();
  }

  await next();
});
