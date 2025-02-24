import { API_KEY_PREFIX } from './api-keys.constants';

export function redactToken({ token }: { token: string }) {
  const keepEnd = 4;
  const keepStart = API_KEY_PREFIX.length;

  return `${token.slice(0, keepStart)}***********************${token.slice(-keepEnd)}`;
}

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
