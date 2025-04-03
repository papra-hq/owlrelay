import type { Component } from 'solid-js';
import type { EmailCallbackFormResult } from '../components/email-callback-form.component';
import { useI18n } from '@/modules/i18n/i18n.provider';
import { Button } from '@/modules/ui/components/button';
import { createToast } from '@/modules/ui/components/sonner';
import { EmailCallbackForm } from '../components/email-callback-form.component';
import { useUpdateEmailCallback } from '../email-callbacks.composables';
import { useEmailCallback } from './email-callback.page';

export const EmailCallbackSettingsPage: Component = () => {
  const { emailCallback } = useEmailCallback();
  const { t } = useI18n();
  const { updateEmailCallback } = useUpdateEmailCallback();

  const handleUpdateEmailCallback = async (args: EmailCallbackFormResult) => {
    await updateEmailCallback({
      emailCallbackId: emailCallback.id,
      emailCallback: {
        ...args,
        webhookSecret: args.webhookSecret !== emailCallback.webhookSecret ? args.webhookSecret : undefined,
      },
    });

    createToast({
      message: t('email-callbacks.form.update.toast'),
      type: 'success',
    });
  };

  return (
    <div class="mx-auto max-w-xl pb-32">
      <EmailCallbackForm
        emailCallback={emailCallback}
        showRandomAddressButton={false}
        onSubmit={handleUpdateEmailCallback}
        submitButton={({ form }) => (
          <Button
            type="submit"
            disabled={form.submitting || !form.touched}
            isLoading={form.submitting}
          >
            {t('email-callbacks.form.update.save-changes')}
          </Button>
        )}
      />
    </div>

  );
};
