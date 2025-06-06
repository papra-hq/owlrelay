import type { ServerInstance } from '../app/server.types';
import { z } from 'zod';
import { getUser } from '../app/auth/auth.models';
import { getDb } from '../app/database/database.models';
import { getEventsServices } from '../app/events/events.models';
import { getConfig } from '../config/config.models';
import { createEmailProcessingsRepository } from '../email-processings/email-processings.repository';
import { createPlansRepository } from '../plans/plans.respository';
import { assert } from '../shared/errors/assert';
import { validateJsonBody, validateParams, validateQuery } from '../shared/validation/validation';
import { createUsersRepository } from '../users/users.repository';
import { createEmailCallbackNotFoundError } from './email-callbacks.errors';
import { checkEmailCallbackUsernameIsAllowed, formatEmailCallbackForApi } from './email-callbacks.models';
import { createEmailCallbacksRepository } from './email-callbacks.repository';
import { emailCallbackIdSchema } from './email-callbacks.schemas';
import { checkUserCanCreateEmailCallback, deleteEmailCallback } from './email-callbacks.usecases';

export async function registerEmailCallbacksPrivateRoutes({ app }: { app: ServerInstance }) {
  setupGetEmailCallbacksRoute({ app });
  setupCreateEmailCallbackRoute({ app });
  setupDeleteEmailCallbackRoute({ app });
  setupUpdateEmailCallbackRoute({ app });
  setupGetEmailCallbackRoute({ app });
  setupGetEmailProcessingsRoute({ app });
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

    validateJsonBody(({ context }) => {
      const { config } = getConfig({ context });
      const { availableDomains } = config.emailCallbacks;

      return z.object({
        domain: z.enum(availableDomains as [string, ...string[]]).optional().default(availableDomains[0]),
        username: z.string().regex(/^[a-z0-9]([\w\-.]*[a-z0-9])?$/i).min(3).max(32),
        webhookUrl: z.string().url(),
        webhookSecret: z.string().min(16).max(128).optional(),
        allowedOrigins: z.array(
          z.string().email(),
        ).optional().default([]),
      });
    },
    ),
    async (context) => {
      const { config } = getConfig({ context });
      const { userId } = getUser({ context });
      const { eventsServices } = getEventsServices({ context });
      const { db } = getDb({ context });

      const { domain, username, webhookUrl, webhookSecret, allowedOrigins } = context.req.valid('json');

      checkEmailCallbackUsernameIsAllowed({ username });

      const emailCallbacksRepository = createEmailCallbacksRepository({ db });
      const usersRepository = createUsersRepository({ db });
      const plansRepository = createPlansRepository({ config });
      await checkUserCanCreateEmailCallback({ userId, usersRepository, plansRepository, emailCallbacksRepository });

      const { emailCallback } = await emailCallbacksRepository.createUserEmailCallback({
        userId,
        emailCallback: { domain, username, webhookUrl, webhookSecret, allowedOrigins, userId },
      });

      eventsServices.triggerEmailCallbackCreatedEvent({ emailCallbackId: emailCallback.id, userId });

      return context.json({
        emailCallback: formatEmailCallbackForApi({ emailCallback }),
      });
    },
  );
}

function setupDeleteEmailCallbackRoute({ app }: { app: ServerInstance }) {
  app.delete(
    '/api/email-callbacks/:emailCallbackIdOrAddress',
    validateParams(
      z.object({
        emailCallbackIdOrAddress: z.union([
          emailCallbackIdSchema,
          z.string().email(),
        ]),
      }),
    ),
    async (context) => {
      const { emailCallbackIdOrAddress } = context.req.valid('param');
      const { userId } = getUser({ context });
      const { db } = getDb({ context });

      const emailCallbacksRepository = createEmailCallbacksRepository({ db });

      await deleteEmailCallback({ userId, emailCallbackIdOrAddress, emailCallbacksRepository });

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
    validateJsonBody(({ context }) => {
      const { config } = getConfig({ context });
      const { availableDomains } = config.emailCallbacks;

      return z.object({
        isEnabled: z.boolean().optional(),
        domain: z.enum(availableDomains as [string, ...string[]]).optional(),
        username: z.string().regex(/^[a-z0-9]([\w\-.]*[a-z0-9])?$/i).min(3).max(32).optional(),
        allowedOrigins: z.array(
          z.string().email(),
        ).optional().default([]),
        webhookUrl: z.string().url().optional(),
        webhookSecret: z.string().min(16).max(128).optional(),
      });
    }),
    async (context) => {
      const { emailCallbackId } = context.req.valid('param');
      const { userId } = getUser({ context });
      const { db } = getDb({ context });
      const { isEnabled, domain, username, allowedOrigins, webhookUrl, webhookSecret } = context.req.valid('json');

      if (username) {
        checkEmailCallbackUsernameIsAllowed({ username });
      }

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

function setupGetEmailCallbackRoute({ app }: { app: ServerInstance }) {
  app.get(
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

      const { emailCallback } = await emailCallbacksRepository.getUserEmailCallback({ userId, emailCallbackId });

      assert(emailCallback, createEmailCallbackNotFoundError);

      return context.json({ emailCallback: formatEmailCallbackForApi({ emailCallback }) });
    },
  );
}

function setupGetEmailProcessingsRoute({ app }: { app: ServerInstance }) {
  app.get(
    '/api/email-callbacks/:emailCallbackId/processings',
    validateParams(
      z.object({
        emailCallbackId: emailCallbackIdSchema,
      }),
    ),
    validateQuery(
      z.object({
        pageIndex: z.coerce.number().min(0).int().optional().default(0),
        pageSize: z.coerce.number().min(1).max(100).int().optional().default(100),
      }),
    ),
    async (context) => {
      const { emailCallbackId } = context.req.valid('param');
      const { userId } = getUser({ context });
      const { db } = getDb({ context });
      const { pageIndex, pageSize } = context.req.valid('query');

      const emailProcessingsRepository = createEmailProcessingsRepository({ db });

      const [{ emailProcessings }, { emailProcessingsCount }] = await Promise.all([
        emailProcessingsRepository.getEmailProcessings({ emailCallbackId, userId, pageIndex, pageSize }),
        emailProcessingsRepository.countEmailProcessings({ emailCallbackId, userId }),
      ]);

      return context.json({
        emailProcessings,
        emailProcessingsCount,
        pageIndex,
        pageSize,
      });
    },
  );
}
