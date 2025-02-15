import { get } from 'lodash-es';

export { isUniqueConstraintError };

function isUniqueConstraintError({ error }: { error: unknown }): boolean {
  const message: unknown = get(error, 'message');
  const code: unknown = get(error, 'code');
  const name: unknown = get(error, 'name');

  return code === 'SQLITE_CONSTRAINT'
    && name === 'LibsqlError'
    && typeof message === 'string'
    && message.includes('UNIQUE constraint failed');
}
