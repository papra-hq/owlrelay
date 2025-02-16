import { describe, expect, test } from 'vitest';
import { assert } from './assert';

describe('assert', () => {
  test('throws the provided error if the condition is falsy', () => {
    expect(() => assert(false, new Error('test'))).toThrow(new Error('test'));
    expect(() => assert(true, new Error('test'))).not.toThrow();
  });

  test('accepts an error factory function', () => {
    expect(() => assert(false, () => new Error('test'))).toThrow(new Error('test'));
    expect(() => assert(true, () => new Error('test'))).not.toThrow();
  });
});
