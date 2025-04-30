import type { ApiKey } from './api-keys.types';
import { apiClient } from '../shared/http/api-client';

export async function getApiKeys() {
  const { apiKeys } = await apiClient<{ apiKeys: ApiKey[] }>({
    path: '/api/api-keys',
  });

  return { apiKeys };
}

export async function createApiKey({ name }: { name: string }) {
  const { apiKey, token } = await apiClient<{ apiKey: ApiKey; token: string }>({
    path: '/api/api-keys',
    method: 'POST',
    body: { name },
  });

  return { apiKey, token };
}

export async function deleteApiKey({ apiKeyId }: { apiKeyId: string }) {
  await apiClient({
    path: `/api/api-keys/${apiKeyId}`,
    method: 'DELETE',
  });
}
