import { describe, expect, test } from 'vitest';
import { getApiKeyUiPrefix, getApiTokenFromAuthorizationHeader } from './api-keys.models';

describe('api-keys models', () => {
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

  describe('getApiKeyUiPrefix', () => {
    test('the prefix is what the user will see in the ui in order to identify the api key, it is the first 5 characters of the token regardless of the token prefix', () => {
      expect(
        getApiKeyUiPrefix({ token: 'owrl_29qxv9eCbRkQQGhwrVZCEXEFjOYpXZX07G4vDK4HT03Jp7fVHyJx1b0l6e1LIEPD' }),
      ).to.eql(
        { prefix: 'owrl_29qxv' },
      );
    });
  });
});
