import { describe, expect, test } from 'vitest';
import { getApiTokenFromAuthorizationHeader, redactToken } from './api-keys.models';

describe('api-keys models', () => {
  describe('redactKey', () => {
    test('when redacted, you can only see the first 8 characters of an API key, the rest is redacted and replaced with some asterisks', () => {
      expect(
        redactToken({ token: 'owrl_pURKbjzbnDRGH4kcYGTqJklat83GTgXWhHI80tF1po' }),
      ).to.eql('owrl_***********************F1po');
    });
  });

  describe('getApiTokenFromAuthorizationHeader', () => {
    test('extract the token from the Authorization bearer header', () => {
      expect(getApiTokenFromAuthorizationHeader({ authorizationHeader: 'Bearer token' })).to.eql({ token: 'token' });
    });

    test('return undefined if the Authorization header is not present or is not in the correct format', () => {
      expect(getApiTokenFromAuthorizationHeader({ authorizationHeader: undefined })).to.eql({ token: undefined });
      expect(getApiTokenFromAuthorizationHeader({ authorizationHeader: '' })).to.eql({ token: undefined });
      expect(getApiTokenFromAuthorizationHeader({ authorizationHeader: 'Bearer' })).to.eql({ token: undefined });
      expect(getApiTokenFromAuthorizationHeader({ authorizationHeader: 'Bearer dfs sdfds' })).to.eql({ token: undefined });
    });
  });
});
