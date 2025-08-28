import { describe, expect, test } from 'vitest';
import { permissiveEmailSchema } from './email-callbacks.schemas';

describe('email-callbacks schemas', () => {
  describe('permissiveEmailSchema', () => {
    test('validates emails even with some special characters, like the ones from "proton forward"', () => {
      expect(permissiveEmailSchema.safeParse('test@example.com').success).toBe(true);
      expect(permissiveEmailSchema.safeParse('test+special@example.com').success).toBe(true);
      expect(permissiveEmailSchema.safeParse('foo=bar.org+biz-buz-314=callback.email@forward.protonmail.ch').success).toBe(true);
    });
  });
});
