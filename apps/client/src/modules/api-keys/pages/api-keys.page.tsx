import { useI18n } from '@/modules/i18n/i18n.provider';
import { useConfirmModal } from '@/modules/shared/confirm';
import { queryClient } from '@/modules/shared/query/query-client';
import { Button } from '@/modules/ui/components/button';
import { createToast } from '@/modules/ui/components/sonner';
import { A } from '@solidjs/router';
import { createQuery } from '@tanstack/solid-query';
import { type Component, For, Show } from 'solid-js';
import { deleteApiKey, getApiKeys } from '../api-keys.services';

export const ApiKeysPage: Component = () => {
  const { t } = useI18n();
  const { confirm } = useConfirmModal();

  const query = createQuery(() => ({
    queryKey: ['api-keys'],
    queryFn: getApiKeys,
  }));

  const deleteKey = async ({ apiKeyId }: { apiKeyId: string }) => {
    const confirmed = await confirm({
      title: t('api-keys.delete.confirm.title'),
      message: t('api-keys.delete.confirm.description'),
      confirmButton: {
        text: t('api-keys.delete.confirm.confirm-button'),
        variant: 'destructive',
      },
      cancelButton: {
        text: t('api-keys.delete.confirm.cancel-button'),
      },
    });

    if (!confirmed) {
      return;
    }

    await deleteApiKey({ apiKeyId });

    await queryClient.invalidateQueries({ queryKey: ['api-keys'] });

    createToast({
      message: t('api-keys.delete.success'),
      type: 'success',
    });
  };

  return (
    <div class="mx-auto max-w-2xl p-6 pb-32">

      <Button as={A} href="/" variant="outline" class="mb-4">
        <div class="i-tabler-arrow-left size-4 mr-2"></div>
        Back
      </Button>

      <div class="flex items-center justify-between mb-2">
        <h1 class="text-xl font-semibold">{t('api-keys.list.title')}</h1>

        <Show when={query.data?.apiKeys.length}>
          <Button as={A} href="/api-keys/create" class="gap-2">
            <div class="i-tabler-plus size-4"></div>
            {t('api-keys.create-api-key')}
          </Button>
        </Show>
      </div>
      <p class="text-muted-foreground border-b pb-6">{t('api-keys.list.description')}</p>

      <Show
        when={query.data?.apiKeys.length}
        fallback={(
          <div class="px-6 py-16 w-full flex flex-col items-center justify-center text-muted-foreground">
            <div class="i-tabler-key size-10"></div>
            <div class="text-center mt-2">{t('api-keys.empty.title')}</div>
            <p class="text-muted-foreground mb-4">{t('api-keys.empty.description')}</p>
            <Button class="gap-2" as={A} href="/api-keys/create">
              <div class="i-tabler-plus size-4"></div>
              {t('api-keys.create-api-key')}
            </Button>
          </div>
        )}
      >
        <div class="flex flex-col gap-4 mt-6">
          <For each={query.data?.apiKeys}>
            {apiKey => (
              <div class="flex items-center justify-between bg-card p-4 rounded-lg border">
                <div>
                  <h2 class="font-semibold">{apiKey.name}</h2>
                  <p class="text-muted-foreground font-mono text-xs">
                    {`${apiKey.prefix}...`}
                  </p>
                </div>

                <div class="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => deleteKey({ apiKeyId: apiKey.id })}
                  >
                    <div class="i-tabler-trash size-4"></div>
                  </Button>
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>

    </div>
  );
};
