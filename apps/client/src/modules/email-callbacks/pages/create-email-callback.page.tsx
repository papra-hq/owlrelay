import type { EmailCallbackFormResult } from '../components/email-callback-form.component';
import type { EmailCallback } from '../email-callbacks.types';
import { useI18n } from '@/modules/i18n/i18n.provider';
import { CopyButton } from '@/modules/shared/utils/copy';
import { Button } from '@/modules/ui/components/button';
import { TextField, TextFieldRoot } from '@/modules/ui/components/textfield';
import { A } from '@solidjs/router';
import { type Component, createSignal, Match, Switch } from 'solid-js';
import { EmailCallbackForm } from '../components/email-callback-form.component';
import { formatEmailAddress } from '../email-callbacks.models';
import { createEmailCallback } from '../email-callbacks.services';

export const CreateEmailCallbackPage: Component = () => {
  const [getCreatedEmailCallback, setCreatedEmailCallback] = createSignal<EmailCallback | null>(null);
  const { t } = useI18n();

  const handleCreateEmailCallback = async (emailCallbackPartial: EmailCallbackFormResult) => {
    const { emailCallback } = await createEmailCallback(emailCallbackPartial);

    setCreatedEmailCallback(emailCallback);
  };

  return (
    <div class="sm:p-6 max-w-2xl mx-auto pb-30">
      <Switch>

        <Match when={getCreatedEmailCallback()}>
          {getEmailCallback => (
            <div class="p-6 mx-auto max-w-lg text-center">
              <div class="i-tabler-mail size-12 text-muted-foreground mx-auto "></div>

              <h1 class="text-xl font-bold mb-2">{t('email-callbacks.created.title')}</h1>

              <p class="text-sm text-muted-foreground text-pretty mb-4">
                {t('email-callbacks.created.description')}
              </p>

              <TextFieldRoot>
                <TextField value={formatEmailAddress(getEmailCallback())} class="text-muted-foreground text-center w-full" />
              </TextFieldRoot>

              <div class="flex gap-2 mt-4 flex-col sm:flex-row w-full justify-center">

                <Button as={A} href="/" variant="outline" class="gap-2 flex-1">
                  <div class="i-tabler-arrow-left size-4"></div>
                  {t('email-callbacks.created.back-to-emails')}
                </Button>

                <CopyButton
                  class="flex-1"
                  text={formatEmailAddress(getEmailCallback())}
                  label={t('email-callbacks.created.copy-email-address')}
                />

              </div>
            </div>
          )}
        </Match>

        <Match when={!getCreatedEmailCallback()}>
          <div class="border-b pb-4 mb-4 mx-6 pt-6 sm:pt-0 sm:mx-0">
            <h1 class="text-xl font-bold">New email</h1>

          </div>

          <EmailCallbackForm
            onSubmit={handleCreateEmailCallback}
            submitButton={({ form }) => (
              <Button
                type="submit"
                disabled={form.submitting}
                isLoading={form.submitting}
              >
                {t('email-callbacks.form.create-email')}
              </Button>
            )}
          />
        </Match>
      </Switch>
    </div>
  );
};
