import type { Database } from '../modules/app/database/database.types';
import { eq, isNotNull } from 'drizzle-orm';
import { getApiKeyHash, getApiKeyUiPrefix } from '../modules/api-keys/api-keys.models';
import { apiKeysTable } from '../modules/api-keys/api-keys.table';

export async function obfuscateApiKey({ db }: { db: Database }) {
  const apiKeys = await db
    .select()
    .from(apiKeysTable)
    .where(
      isNotNull(apiKeysTable.token),
    );

  for (const { id, token } of apiKeys) {
    if (!token) {
      continue;
    }

    const { keyHash } = await getApiKeyHash({ token });
    const { prefix } = getApiKeyUiPrefix({ token });

    await db
      .update(apiKeysTable)
      .set({ keyHash, prefix, token: null })
      .where(eq(apiKeysTable.id, id));
  }
}
