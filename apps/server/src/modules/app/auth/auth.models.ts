import type { Context } from '../server.types';
import { createError } from '../../shared/errors/errors';

export function getUser({ context }: { context: Context }) {
  const userId = context.get('userId');

  if (!userId) {
    throw createError({
      message: 'User not found in context',
      code: 'users.not_found',
      statusCode: 403,
      isInternal: true,
    });
  }

  return {
    userId,
  };
}

export function getSession({ context }: { context: Context }) {
  const session = context.get('session');

  return { session };
}
