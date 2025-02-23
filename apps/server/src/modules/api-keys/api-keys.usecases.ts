import type { Config } from '../config/config.types';
import type { ApiKeysRepository } from './api-keys.repository';
import { createTooManyApiKeysError } from './api-keys.errors';

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

  const { apiKey } = await apiKeysRepository.createApiKey({ userId, name });

  return { apiKey };
}
