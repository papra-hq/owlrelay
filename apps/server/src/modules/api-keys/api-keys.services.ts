import { generateToken } from '../shared/random/random';
import { API_KEY_PREFIX } from './api-keys.constants';

export function generateApiToken() {
  const { token } = generateToken({ length: 42 });

  return `${API_KEY_PREFIX}${token}`;
}
