import { describe, expect, test } from 'vitest';
import { emailUsernameRegex } from './email-callbacks.constants';

describe('email-callbacks constants', () => {
  describe('emailUsernameRegex', () => {
    const isValid = (username: string) => emailUsernameRegex.test(username);

    test('an email username should be alphanumeric and can contain dashes, dots and underscores (but not at the beginning or end)', () => {
      expect(isValid('johndoe')).toBe(true);
      expect(isValid('john.doe')).toBe(true);
      expect(isValid('john-doe')).toBe(true);
      expect(isValid('john_doe')).toBe(true);
      expect(isValid('a.b_c-d')).toBe(true);

      expect(isValid('foo-')).toBe(false);
      expect(isValid('foo.')).toBe(false);
      expect(isValid('foo_')).toBe(false);
      expect(isValid('-foo')).toBe(false);
      expect(isValid('_foo')).toBe(false);
      expect(isValid('.foo')).toBe(false);
    });

    test('case does not matter', () => {
      expect(isValid('FOO-BAR')).toBe(true);
      expect(isValid('Foo-bAr')).toBe(true);
    });

    test('username can contain numbers', () => {
      expect(isValid('foo123')).toBe(true);
      expect(isValid('0foo123bar9')).toBe(true);
    });

    test('no special characters are allowed', () => {
      expect(isValid('foo$')).toBe(false);
      expect(isValid('fooé')).toBe(false);
      expect(isValid('foo@')).toBe(false);
      expect(isValid('foo#')).toBe(false);
      expect(isValid('foo%')).toBe(false);
      expect(isValid('foo^')).toBe(false);
      expect(isValid('foo&')).toBe(false);
      expect(isValid('foo*')).toBe(false);
      expect(isValid('foo(')).toBe(false);
    });
  });
});
