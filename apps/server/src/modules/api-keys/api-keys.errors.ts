import { createErrorFactory } from '../shared/errors/errors';

export const createTooManyApiKeysError = createErrorFactory({
  message: 'You have reached the maximum number of API keys allowed.',
  code: 'api_keys.too_many_api_keys',
  statusCode: 400,
});

export const createApiKeyNotFoundError = createErrorFactory({
  message: 'API key not found.',
  code: 'api_keys.api_key_not_found',
  statusCode: 404,
});
