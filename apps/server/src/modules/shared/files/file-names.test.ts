import { describe, expect, test } from 'vitest';
import { getExtension } from './file-names';

describe('extensions', () => {
  describe('getExtension', () => {
    test('extracts the extension from a file name', () => {
      expect(getExtension({ fileName: 'file.txt' })).to.eql({ extension: 'txt' });
      expect(getExtension({ fileName: 'file.test.txt' })).to.eql({ extension: 'txt' });
    });

    test('file name without extension returns no extension', () => {
      expect(getExtension({ fileName: 'file' })).to.eql({ extension: undefined });
      expect(getExtension({ fileName: 'file.' })).to.eql({ extension: undefined });
      expect(getExtension({ fileName: '' })).to.eql({ extension: undefined });
      expect(getExtension({ fileName: '.' })).to.eql({ extension: undefined });
    });
  });
});
