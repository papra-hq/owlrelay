import { sha256 } from '../shared/crypto/hash';
import { API_KEY_PREFIX } from './api-keys.constants';

export function getApiTokenFromAuthorizationHeader({ authorizationHeader }: { authorizationHeader: string | undefined }) {
  if (!authorizationHeader) {
    return { token: undefined };
  }

  const parts = authorizationHeader.split(' ');

  if (parts.length !== 2) {
    return { token: undefined };
  }

  const [type, token] = parts;

  if (type !== 'Bearer') {
    return { token: undefined };
  }

  return { token };
}

export function getApiKeyUiPrefix({ token }: { token: string }) {
  return {
    prefix: token.slice(0, 5 + API_KEY_PREFIX.length + 1),
  };
}

export async function getApiKeyHash({ token }: { token: string }) {
  return {
    keyHash: await sha256(token, { digest: 'base64url' }),
  };
}
