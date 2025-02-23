import type { Context } from '../app/server.types';
import { createMiddleware } from 'hono/factory';
import { createUnauthorizedError } from '../app/auth/auth.errors';
import { getDb } from '../app/database/database.models';
import { getAuthorizationHeader } from '../shared/headers/headers.models';
import { createLogger } from '../shared/logger/logger';
import { getApiTokenFromAuthorizationHeader } from './api-keys.models';
import { createApiKeysRepository } from './api-keys.repository';

const logger = createLogger({ namespace: 'api-key-middleware' });

export const apiKeyMiddleware = createMiddleware(async (context: Context, next) => {
  const userId = context.get('userId');
  const isAlreadyAuthenticated = Boolean(userId);

  const { authorizationHeader } = getAuthorizationHeader({ context });

  const { token } = getApiTokenFromAuthorizationHeader({ authorizationHeader });

  if (!token && isAlreadyAuthenticated) {
    // If the user is already authenticated, like with better-auth,
    // and a token is present in headers, we allow the request to pass
    return next();
  }

  if (!token) {
    logger.info('No token found in headers');
    throw createUnauthorizedError();
  }

  if (token && isAlreadyAuthenticated) {
    // If the user is already authenticated, like with better-auth,
    // we raise an error when a token is present in headers
    // this is to prevent authentication ambiguity
    logger.info('Token found in headers but user is already authenticated');
    throw createUnauthorizedError();
  }

  const { db } = getDb({ context });
  const apiKeyRepository = createApiKeysRepository({ db });

  const { apiKey } = await apiKeyRepository.getApiKeyByToken({ token });

  if (!apiKey) {
    logger.info('Invalid token, no api key found');
    throw createUnauthorizedError();
  }

  context.set('userId', apiKey.userId);

  await next();
});
