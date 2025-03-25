import type { ServerInstance } from '../app/server.types';
import { z } from 'zod';
import { getUser } from '../app/auth/auth.models';
import { getDb } from '../app/database/database.models';
import { getEventsServices } from '../app/events/events.models';
import { getConfig } from '../config/config.models';
import { validateJsonBody, validateParams } from '../shared/validation/validation';
import { redactToken } from './api-keys.models';
import { createApiKeysRepository } from './api-keys.repository';
import { createApiKey } from './api-keys.usecases';

export async function registerApiKeysPrivateRoutes({ app }: { app: ServerInstance }) {
  setupCreateApiKeyRoute({ app });
  setupDeleteApiKeyRoute({ app });
  setupGetApiKeysRoute({ app });
}

function setupCreateApiKeyRoute({ app }: { app: ServerInstance }) {
  app.post(
    '/api/api-keys',
    validateJsonBody(z.object({
      name: z.string().min(1).max(128),
    })),
    async (context) => {
      const { userId } = getUser({ context });
      const { db } = getDb({ context });
      const { eventsServices } = getEventsServices({ context });
      const { config } = getConfig({ context });

      const apiKeysRepository = createApiKeysRepository({ db });

      const { name } = context.req.valid('json');

      const { apiKey } = await createApiKey({ userId, name, apiKeysRepository, config });

      eventsServices.triggerApiKeyCreatedEvent({ apiKeyId: apiKey.id, userId });

      return context.json({ apiKey });
    },
  );
}

function setupDeleteApiKeyRoute({ app }: { app: ServerInstance }) {
  app.delete(
    '/api/api-keys/:apiKeyId',
    validateParams(z.object({
      apiKeyId: z.string(),
    })),
    async (context) => {
      const { userId } = getUser({ context });
      const { db } = getDb({ context });

      const apiKeysRepository = createApiKeysRepository({ db });

      const { apiKeyId } = context.req.valid('param');

      await apiKeysRepository.deleteUserApiKey({ userId, apiKeyId });

      return context.body(null, 204);
    },
  );
}

function setupGetApiKeysRoute({ app }: { app: ServerInstance }) {
  app.get(
    '/api/api-keys',
    async (context) => {
      const { userId } = getUser({ context });
      const { db } = getDb({ context });

      const apiKeysRepository = createApiKeysRepository({ db });

      const { apiKeys } = await apiKeysRepository.getUserApiKeys({ userId });

      return context.json({
        apiKeys: apiKeys.map(apiKey => ({
          ...apiKey,
          token: redactToken({ token: apiKey.token }),
        })),
      });
    },
  );
}
