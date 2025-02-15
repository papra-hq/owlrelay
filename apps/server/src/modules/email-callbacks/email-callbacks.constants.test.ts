import { describe, expect, test } from 'vitest';
import { emailCallbackIdRegex } from './email-callbacks.constants';

describe('email-callbacks constants', () => {
  describe('emailCallbackIdRegex', () => {
    test('email callback id starts with the ecb prefix and followed by a lowercase letter and 2-32 alphanumeric characters', () => {
      expect(emailCallbackIdRegex.test('ecb_a1234567890')).toBe(true);
      expect(emailCallbackIdRegex.test('ecb_a1234567890')).toBe(true);
      expect(emailCallbackIdRegex.test('ecb_a1234567890')).toBe(true);
      expect(emailCallbackIdRegex.test('ecb_a1234567890')).toBe(true);
      expect(emailCallbackIdRegex.test('ecb_a1234567890')).toBe(true);
      expect(emailCallbackIdRegex.test('ecb_a1234567890')).toBe(true);
      expect(emailCallbackIdRegex.test('ecb_a1234567890')).toBe(true);
    });
  });
});
