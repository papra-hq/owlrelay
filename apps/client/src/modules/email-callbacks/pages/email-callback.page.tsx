import type { EmailCallback } from '../email-callbacks.types';
import { useI18n } from '@/modules/i18n/i18n.provider';
import { cn } from '@/modules/shared/style/cn';
import { CopyIconButton } from '@/modules/shared/utils/copy';
import { Button } from '@/modules/ui/components/button';
import { A, useNavigate, useParams } from '@solidjs/router';
import { createQuery } from '@tanstack/solid-query';
import { createContext, type ParentComponent, Show, useContext } from 'solid-js';
import { DisabledEmailBadge } from '../components/disabled-email-badge.component';
import { useDeleteEmailCallback, useUpdateEmailCallback } from '../email-callbacks.composables';
import { formatEmailAddress } from '../email-callbacks.models';
import { getEmailCallback } from '../email-callbacks.services';

const emailCallbackContext = createContext<{
  emailCallback: EmailCallback;
}>();

export function useEmailCallback() {
  const context = useContext(emailCallbackContext);
  if (!context) {
    throw new Error('Email callback context not found');
  }
  return context;
}

export const EmailCallbackPage: ParentComponent = (props) => {
  const { t } = useI18n();
  const params = useParams();
  const navigate = useNavigate();

  const { deleteEmailCallback } = useDeleteEmailCallback();
  const { enableEmailCallback, disableEmailCallback } = useUpdateEmailCallback();

  const query = createQuery(() => ({
    queryKey: ['email-callbacks', params.emailCallbackId],
    queryFn: () => getEmailCallback({ emailCallbackId: params.emailCallbackId }),
  }));

  async function handleDeleteEmailCallback({ emailCallbackId }: { emailCallbackId: string }) {
    await deleteEmailCallback({ emailCallbackId });
    navigate('/');
  }

  return (
    <div class="max-w-1200px w-full mx-auto px-6 pt-2">
      <Show when={query.data?.emailCallback}>
        {getEmailCallback => (
          <div>
            <div class="border-b py-4 pb-0 mb-8">
              <div class="mb-6">
                <Button variant="outline" size="sm" class="gap-2" as={A} href="/">
                  <div class="i-tabler-chevron-left size-4" />
                  {t('email-callbacks.back-to-emails')}
                </Button>
              </div>

              <div class=" flex flex-row gap-3 sm:items-center justify-between flex-col sm:flex-row">
                <div class="flex flex-row gap-3 items-center">
                  <div class="bg-card border rounded-lg p-2.5 hidden sm:block">
                    <div class={cn('i-tabler-mail size-7')} />
                  </div>

                  <div>
                    <div class="text-base font-medium flex flex-row gap-2 items-center">
                      {formatEmailAddress(getEmailCallback())}
                      <CopyIconButton
                        text={formatEmailAddress(getEmailCallback())}
                        class="text-muted-foreground size-5 text-base"
                        toast={t('email-callbacks.copy-email-address.copied')}
                        tooltip={t('email-callbacks.copy-email-address.label')}
                      />

                      <Show when={!getEmailCallback().isEnabled}>
                        <DisabledEmailBadge />
                      </Show>

                    </div>

                    <div class="text-muted-foreground">
                      {getEmailCallback().webhookUrl}
                    </div>
                  </div>
                </div>

                <div class="flex flex-row gap-2">
                  <Button
                    class="gap-2"
                    variant="outline"
                    onClick={() => getEmailCallback().isEnabled
                      ? disableEmailCallback({ emailCallbackId: getEmailCallback().id })
                      : enableEmailCallback({ emailCallbackId: getEmailCallback().id })}
                  >
                    <div class="i-tabler-power size-4" />
                    {getEmailCallback().isEnabled ? t('email-callbacks.disable') : t('email-callbacks.enable')}
                  </Button>

                  <Button class="gap-2 text-red-500" variant="outline" onClick={() => handleDeleteEmailCallback({ emailCallbackId: getEmailCallback().id })}>
                    <div class="i-tabler-trash size-4" />
                    {t('email-callbacks.delete')}
                  </Button>
                </div>
              </div>

              <div class="flex flex-row gap-2 mt-4">
                <Button variant="ghost" as={A} href={`/email-callbacks/${getEmailCallback().id}/inbox`} activeClass="border-b-2 border-b-primary text-foreground!" class="rounded-b-none text-muted-foreground transition bg-transparent!">
                  {t('email-callbacks.inbox')}
                </Button>

                <Button variant="ghost" as={A} href={`/email-callbacks/${getEmailCallback().id}/settings`} activeClass="border-b-2 border-b-primary text-foreground!" class="rounded-b-none text-muted-foreground transition bg-transparent!">
                  {t('email-callbacks.settings')}
                </Button>

              </div>
            </div>

            <emailCallbackContext.Provider
              value={{ emailCallback: getEmailCallback() }}
            >
              {props.children}
            </emailCallbackContext.Provider>

          </div>
        )}
      </Show>
    </div>
  );
};
