import { get } from 'lodash-es';

export { isUniqueConstraintError };

function isUniqueConstraintError({ error }: { error: unknown }): boolean {
  const message: unknown = get(error, 'message');
  const code: unknown = get(error, 'code');
  const name: unknown = get(error, 'name');

  if (typeof code !== 'string' || typeof name !== 'string' || typeof message !== 'string') {
    return false;
  }

  if (name !== 'LibsqlError') {
    return false;
  }

  if (code === 'SQLITE_CONSTRAINT_UNIQUE') {
    return true;
  }

  return message.includes('UNIQUE constraint failed');
}
