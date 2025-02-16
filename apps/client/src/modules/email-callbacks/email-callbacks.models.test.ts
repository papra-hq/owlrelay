import { describe, expect, test } from 'vitest';
import { formatEmailAddress } from './email-callbacks.models';

describe('email-callbacks models', () => {
  describe('formatEmailAddress', () => {
    test('concatenates username and domain with @', () => {
      expect(formatEmailAddress({ username: 'test', domain: 'example.com' })).to.equal('test@example.com');
    });
  });
});
