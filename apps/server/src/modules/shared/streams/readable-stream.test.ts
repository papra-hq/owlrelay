import { describe, expect, test } from 'vitest';
import { collectReadableStreamToString } from './readable-stream';

describe('readable-stream', () => {
  describe('collectReadableStreamToString', () => {
    test('fully reads a readable stream and returns its content as a string', async () => {
      const content = 'Hello, world!';
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(content));
          controller.close();
        },
      });

      const result = await collectReadableStreamToString({ stream });

      expect(result).toEqual('Hello, world!');
    });

    test('useful to read a File object stream', async () => {
      const file = new File(['Hello, world!'], 'hello.txt', { type: 'text/plain' });
      const stream = file.stream();

      const result = await collectReadableStreamToString({ stream });

      expect(result).toEqual('Hello, world!');
    });
  });
});
