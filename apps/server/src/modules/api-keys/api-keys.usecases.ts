import type { Config } from '../config/config.types';
import type { ApiKeysRepository } from './api-keys.repository';
import { createTooManyApiKeysError } from './api-keys.errors';
import { getApiKeyHash, getApiKeyUiPrefix } from './api-keys.models';
import { generateApiToken } from './api-keys.services';

export async function createApiKey({ userId, name, apiKeysRepository, config }: {
  userId: string;
  name: string;
  apiKeysRepository: ApiKeysRepository;
  config: Config;
}) {
  const { apiKeysCount } = await apiKeysRepository.countUserApiKeys({ userId });

  if (apiKeysCount >= config.apiKeys.maxApiKeysPerUser) {
    throw createTooManyApiKeysError();
  }

  const { token } = generateApiToken();

  const { prefix } = getApiKeyUiPrefix({ token });
  const { keyHash } = await getApiKeyHash({ token });

  const { apiKey } = await apiKeysRepository.saveApiKey({ userId, name, prefix, keyHash });

  return { apiKey, token };
}

export async function getApiKey({ token, apiKeyRepository }: { token: string; apiKeyRepository: ApiKeysRepository }) {
  const { keyHash } = await getApiKeyHash({ token });

  const { apiKey } = await apiKeyRepository.getApiKeyByHash({ keyHash });

  return { apiKey };
}
