import { describe, expect, test } from 'vitest';
import { isUniqueConstraintError } from './constraints.models';

describe('constraints models', () => {
  describe('isUniqueConstraintError', () => {
    test('in case of an insertion of a record with a unique constraint violation, an error with code SQLITE_CONSTRAINT_UNIQUE or SQLITE_CONSTRAINT, and a message containing "UNIQUE constraint failed" is raised by the db driver', () => {
      expect(isUniqueConstraintError({
        error: {
          code: 'SQLITE_CONSTRAINT_UNIQUE',
          name: 'LibsqlError',
          message: 'UNIQUE constraint failed',
        },
      })).to.eql(true);
      expect(isUniqueConstraintError({
        error: Object.assign(new Error('error'), {
          name: 'LibsqlError',
          message: 'UNIQUE constraint failed',
          code: 'SQLITE_CONSTRAINT',
        }),
      })).to.eql(true);

      expect(isUniqueConstraintError({ error: { code: 'other' } })).to.eql(false);
      expect(isUniqueConstraintError({ error: {} })).to.eql(false);
      expect(isUniqueConstraintError({ error: null })).to.eql(false);
      expect(isUniqueConstraintError({ error: new Set([Symbol('bob')]) })).to.eql(false);
    });
  });
});
