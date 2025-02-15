import type { ServerInstance } from '../app/server.types';
import { z } from 'zod';
import { getUser } from '../app/auth/auth.models';
import { getDb } from '../app/database/database.models';
import { validateJsonBody, validateParams } from '../shared/validation/validation';
import { formatEmailCallbackForApi } from './email-callbacks.models';
import { createEmailCallbacksRepository } from './email-callbacks.repository';
import { emailCallbackIdSchema } from './email-callbacks.schemas';

export async function registerEmailCallbacksPrivateRoutes({ app }: { app: ServerInstance }) {
  setupGetEmailCallbacksRoute({ app });
  setupCreateEmailCallbackRoute({ app });
  setupDeleteEmailCallbackRoute({ app });
  setupUpdateEmailCallbackRoute({ app });
}

function setupGetEmailCallbacksRoute({ app }: { app: ServerInstance }) {
  app.get('/api/email-callbacks', async (context) => {
    const { userId } = getUser({ context });
    const { db } = getDb({ context });

    const emailCallbacksRepository = createEmailCallbacksRepository({ db });

    const { emailCallbacks } = await emailCallbacksRepository.getUserEmailCallbacks({ userId });

    return context.json({
      emailCallbacks: emailCallbacks.map(emailCallback => formatEmailCallbackForApi({ emailCallback })),
    });
  });
}

function setupCreateEmailCallbackRoute({ app }: { app: ServerInstance }) {
  app.post(
    '/api/email-callbacks',
    validateJsonBody(
      z.object({
        domain: z.string().min(1),
        username: z.string().regex(/^[a-z0-9]([\w\-.]*[a-z0-9])?$/i).min(3).max(32),
        webhookUrl: z.string().url(),
        webhookSecret: z.string().min(16).max(128),
        allowedOrigins: z.array(z.string().url()).optional().default([]),
      }),
    ),
    async (context) => {
      const { userId } = getUser({ context });
      const { db } = getDb({ context });
      const { domain, username, webhookUrl, webhookSecret, allowedOrigins } = context.req.valid('json');

      const emailCallbacksRepository = createEmailCallbacksRepository({ db });

      const { emailCallback } = await emailCallbacksRepository.createUserEmailCallback({
        userId,
        emailCallback: { domain, username, webhookUrl, webhookSecret, allowedOrigins, userId },
      });

      return context.json({
        emailCallback: formatEmailCallbackForApi({ emailCallback }),
      });
    },
  );
}

function setupDeleteEmailCallbackRoute({ app }: { app: ServerInstance }) {
  app.delete(
    '/api/email-callbacks/:emailCallbackId',
    validateParams(
      z.object({
        emailCallbackId: emailCallbackIdSchema,
      }),
    ),
    async (context) => {
      const { emailCallbackId } = context.req.valid('param');
      const { userId } = getUser({ context });
      const { db } = getDb({ context });

      const emailCallbacksRepository = createEmailCallbacksRepository({ db });

      await emailCallbacksRepository.deleteUserEmailCallback({ userId, emailCallbackId });

      return context.body(null, 204);
    },
  );
}

function setupUpdateEmailCallbackRoute({ app }: { app: ServerInstance }) {
  app.put(
    '/api/email-callbacks/:emailCallbackId',
    validateParams(
      z.object({
        emailCallbackId: emailCallbackIdSchema,
      }),
    ),
    validateJsonBody(
      z.object({
        isEnabled: z.boolean().optional(),
        domain: z.string().optional(),
        username: z.string().regex(/^[a-z0-9]([\w\-.]*[a-z0-9])?$/i).min(3).max(32).optional(),
        allowedOrigins: z.array(z.string().url()).optional(),
        webhookUrl: z.string().url().optional(),
        webhookSecret: z.string().min(16).max(128).optional(),
      }),
    ),
    async (context) => {
      const { emailCallbackId } = context.req.valid('param');
      const { userId } = getUser({ context });
      const { db } = getDb({ context });
      const { isEnabled, domain, username, allowedOrigins, webhookUrl, webhookSecret } = context.req.valid('json');

      const emailCallbacksRepository = createEmailCallbacksRepository({ db });

      const { emailCallback } = await emailCallbacksRepository.updateUserEmailCallback({
        userId,
        emailCallbackId,
        emailCallback: {
          isEnabled,
          domain,
          username,
          allowedOrigins,
          webhookUrl,
          webhookSecret,
        },
      });

      return context.json({
        emailCallback: formatEmailCallbackForApi({ emailCallback }),
      });
    },
  );
}
