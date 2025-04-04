import { describe, expect, test } from 'vitest';
import { coerceDate, getEmailIdentifier } from './api.models';

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

  describe('getEmailIdentifier', () => {
    test('an email can either be identified by its id, its address or its username and domain', () => {
      expect(getEmailIdentifier({ emailId: 'ecb_a111111' })).to.deep.equal({ emailIdentifier: 'ecb_a111111' });
      expect(getEmailIdentifier({ emailAddress: 'foo@example.fr' })).to.deep.equal({ emailIdentifier: 'foo@example.fr' });
      expect(getEmailIdentifier({ username: 'foo', domain: 'example.fr' })).to.deep.equal({ emailIdentifier: 'foo@example.fr' });
    });

    test('if multiple arguments are provided, the email identifier is the one of the email id, then the address, then the username and domain', () => {
      expect(getEmailIdentifier({
        emailId: 'ecb_a111111',
        emailAddress: 'foo@example.fr',
        username: 'foo',
        domain: 'example.fr',
      })).to.deep.equal({ emailIdentifier: 'ecb_a111111' });

      expect(getEmailIdentifier({
        emailAddress: 'foo@example.fr',
        username: 'foo',
        domain: 'example.fr',
      })).to.deep.equal({ emailIdentifier: 'foo@example.fr' });

      expect(getEmailIdentifier({
        username: 'foo',
        domain: 'example.fr',
      })).to.deep.equal({ emailIdentifier: 'foo@example.fr' });
    });
  });
});
