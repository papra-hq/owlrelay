import { useConfirmModal } from '../shared/confirm';
import { queryClient } from '../shared/query/query-client';
import { createToast } from '../ui/components/sonner';
import { createEmailCallback, deleteEmailCallback, updateEmailCallback as updateEmailCallbackService } from './email-callbacks.services';

async function invalidateEmailCallbacks() {
  await queryClient.invalidateQueries({
    queryKey: ['email-callbacks'],
    refetchType: 'all',
  });
}

export function useCreateEmailCallback() {
  return {
    createEmailCallback: async (emailCallback: {
      domain: string;
      username: string;
      allowedOrigins: string[];
      webhookUrl: string;
      webhookSecret: string;
    }) => {
      await createEmailCallback(emailCallback);

      await invalidateEmailCallbacks();
    },
  };
}

export function useDeleteEmailCallback() {
  const { confirm } = useConfirmModal();

  return {
    deleteEmailCallback: async ({ emailCallbackId }: { emailCallbackId: string }) => {
      const confirmed = await confirm({
        title: 'Delete email',
        message: 'Are you sure you want to delete this email? This action cannot be undone.',
        cancelButton: {
          text: 'Cancel',
        },
        confirmButton: {
          text: 'Delete email',
          variant: 'destructive',
        },
      });

      if (!confirmed) {
        return;
      }

      await deleteEmailCallback({ emailCallbackId });

      await invalidateEmailCallbacks();
    },
  };
}

export function useUpdateEmailCallback() {
  const updateEmailCallback = async ({
    emailCallbackId,
    emailCallback,
  }: {
    emailCallbackId: string;
    emailCallback: {
      isEnabled?: boolean;
      domain?: string;
      username?: string;
      allowedOrigins?: string[];
      webhookUrl?: string;
      webhookSecret?: string;
    };
  }) => {
    await updateEmailCallbackService({ emailCallbackId, emailCallback });

    await invalidateEmailCallbacks();
  };

  return {
    updateEmailCallback,
    enableEmailCallback: async ({ emailCallbackId }: { emailCallbackId: string }) => {
      await updateEmailCallback({ emailCallbackId, emailCallback: { isEnabled: true } });

      createToast({
        message: 'Email enabled',
        description: 'The email has been enabled and will now trigger webhooks when emails are sent to it.',
      });
    },
    disableEmailCallback: async ({ emailCallbackId }: { emailCallbackId: string }) => {
      await updateEmailCallback({ emailCallbackId, emailCallback: { isEnabled: false } });

      createToast({
        message: 'Email disabled',
        description: 'The email has been disabled and will no longer trigger webhooks when emails are sent to it.',
        duration: 7000,
      });
    },
  };
}
