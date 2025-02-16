import type { Context } from '../server.types';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/d1';
import { createError } from '../../shared/errors/errors';

export { setupDatabase };

function setupDatabase({
  binding,
}: {
  binding?: D1Database;
}) {
  if (!binding) {
    throw createError({
      message: 'Database binding not found',
      code: 'server.database.binding_not_found',
      statusCode: 500,
      isInternal: true,
    });
  }

  const db = drizzle(binding);

  return {
    db,
  };
}
