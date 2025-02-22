import { cn } from '@/modules/shared/style/cn';
import { CopyIconButton } from '@/modules/shared/utils/copy';
import { Button } from '@/modules/ui/components/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/modules/ui/components/dropdown-menu';
import { A } from '@solidjs/router';
import { createQuery } from '@tanstack/solid-query';
import { type Component, For, Match, Switch } from 'solid-js';
import { useDeleteEmailCallback, useUpdateEmailCallback } from '../email-callbacks.composables';
import { formatEmailAddress } from '../email-callbacks.models';
import { getEmailCallbacks } from '../email-callbacks.services';

export const EmailsPage: Component = () => {
  const { deleteEmailCallback } = useDeleteEmailCallback();
  const { enableEmailCallback, disableEmailCallback } = useUpdateEmailCallback();

  const query = createQuery(() => ({
    queryKey: ['email-callbacks'],
    queryFn: getEmailCallbacks,
  }));

  return (
    <div class="max-w-1200px w-full mx-auto p-6">
      <Switch>
        <Match when={query.data?.emailCallbacks.length === 0}>
          <div class="px-6 py-16 w-full flex flex-col items-center justify-center">
            <div class="i-tabler-mail size-10"></div>
            <div class="text-center mb-4 mt-2">Create your first email to trigger a webhook</div>
            <Button class="gap-2" as={A} href="/email-callbacks/create">
              <div class="i-tabler-plus size-4"></div>
              Create email
            </Button>
          </div>
        </Match>
        <Match when={query.data?.emailCallbacks.length}>

          <div class="flex flex-row gap-2 mb-2 justify-between items-center">
            <div class="text-base font-medium">
              Your emails
            </div>

            <Button class="gap-2" as={A} href="/email-callbacks/create">
              <div class="i-tabler-plus size-4"></div>
              Create new email
            </Button>
          </div>

          <div class="flex flex-col gap-2">
            <For each={query.data?.emailCallbacks ?? []}>
              {emailCallback => (
                <div class="border bg-card rounded-xl p-4 flex flex-row justify-between items-center">
                  <div class="flex flex-row gap-4 items-center">
                    <div class="bg-background border rounded-lg p-2 hidden sm:block">
                      <div class={cn('i-tabler-mail size-5')} />
                    </div>

                    <div>
                      <span class="flex flex-row gap-2 items-center">
                        <A href={`/email-callbacks/${emailCallback.id}`} class="leading-tight font-medium hover:underline">{formatEmailAddress(emailCallback)}</A>
                        <CopyIconButton text={formatEmailAddress(emailCallback)} class="text-muted-foreground size-4.5" toast="Email copied to clipboard" tooltip="Copy email address" />
                        {!emailCallback.isEnabled && <div class="text-xs text-muted-foreground">(Disabled)</div>}
                      </span>
                      <div class="text-xs text-muted-foreground">{emailCallback.webhookUrl}</div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger as={Button} variant="ghost" size="icon">
                      <div class="i-tabler-dots-vertical size-4"></div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>

                      <DropdownMenuItem as={A} href={`/email-callbacks/${emailCallback.id}`} class="flex flex-row gap-2 cursor-pointer">
                        <div class="i-tabler-history size-4"></div>
                        View history
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => emailCallback.isEnabled
                          ? disableEmailCallback({ emailCallbackId: emailCallback.id })
                          : enableEmailCallback({ emailCallbackId: emailCallback.id })}
                        class="flex flex-row gap-2 cursor-pointer"
                      >
                        <div class={cn('size-4', emailCallback.isEnabled ? 'i-tabler-circle-x' : 'i-tabler-circle-check')} />
                        {emailCallback.isEnabled ? 'Disable email' : 'Enable email'}
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => deleteEmailCallback({ emailCallbackId: emailCallback.id })} class="flex flex-row gap-2 cursor-pointer">
                        <div class="i-tabler-trash size-4"></div>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </For>
          </div>
        </Match>
      </Switch>
    </div>
  );
};
