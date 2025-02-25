import { describe, expect, test } from 'vitest';
import { coerceDate } from './api.models';

describe('api models', () => {
  describe('coerceDate', () => {
    test('transforms createdAt and updatedAt iso strings to Date objects', () => {
      const obj = {
        foo: 'bar',
        createdAt: '2021-01-01T00:00:00.000Z',
        updatedAt: '2021-01-02T00:00:00.000Z',
      };

      const result = coerceDate(obj);

      expect(result).to.deep.equal({
        foo: 'bar',
        createdAt: new Date('2021-01-01T00:00:00.000Z'),
        updatedAt: new Date('2021-01-02T00:00:00.000Z'),
      });
    });
  });
});
