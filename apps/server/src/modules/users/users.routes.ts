import type { ServerInstance } from '../app/server.types';
import { pick } from 'lodash-es';
import { z } from 'zod';
import { getUser } from '../app/auth/auth.models';
import { getDb } from '../app/database/database.models';
import { validateJsonBody } from '../shared/validation/validation';
import { createUsersRepository } from './users.repository';

export async function registerUsersPrivateRoutes({ app }: { app: ServerInstance }) {
  setupGetCurrentUserRoute({ app });
  setupUpdateUserRoute({ app });
}

function setupGetCurrentUserRoute({ app }: { app: ServerInstance }) {
  app.get('/api/users/me', async (context) => {
    const { userId } = getUser({ context });
    const { db } = getDb({ context });

    const usersRepository = createUsersRepository({ db });

    const [
      { user },
    ] = await Promise.all([
      usersRepository.getUserByIdOrThrow({ userId }),
    ]);

    return context.json({
      user: pick(
        user,
        [
          'id',
          'email',
          'name',
          'createdAt',
          'updatedAt',
        ],
      ),
    });
  });
}

function setupUpdateUserRoute({ app }: { app: ServerInstance }) {
  app.put(
    '/api/users/me',
    validateJsonBody(z.object({
      name: z.string().min(1).max(50),
    })),
    async (context) => {
      const { userId } = getUser({ context });
      const { db } = getDb({ context });

      const { name } = context.req.valid('json');

      const usersRepository = createUsersRepository({ db });

      const { user } = await usersRepository.updateUser({ userId, name });

      return context.json({ user });
    },
  );
}
