import type { DialogTriggerProps } from '@kobalte/core/dialog';
import type { EmailCallback } from '../email-callbacks.types';
import { useConfig } from '@/modules/config/config.provider';
import { createForm } from '@/modules/shared/form/form';
import { isHttpErrorWithCode } from '@/modules/shared/http/http-errors';
import { cn } from '@/modules/shared/style/cn';
import { Button } from '@/modules/ui/components/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/modules/ui/components/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/modules/ui/components/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/modules/ui/components/select';
import { TextField, TextFieldLabel, TextFieldRoot } from '@/modules/ui/components/textfield';
import { safely } from '@corentinth/chisels';
import { generateId } from '@corentinth/friendly-ids';
import { getError, setValue } from '@modular-forms/solid';
import { A } from '@solidjs/router';
import { createQuery } from '@tanstack/solid-query';
import { type Component, createSignal, For, type JSX, Match, Switch } from 'solid-js';
import * as v from 'valibot';
import { useCreateEmailCallback, useDeleteEmailCallback, useUpdateEmailCallback } from '../email-callbacks.composables';
import { emailUsernameRegex } from '../email-callbacks.constants';
import { formatEmailAddress, generateEmailCallbackSecret } from '../email-callbacks.models';
import { getEmailCallbacks } from '../email-callbacks.services';

const EmailCallbackModal: Component<{
  emailCallback?: EmailCallback;
  children: (props: DialogTriggerProps) => JSX.Element;
}> = (props) => {
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const { config } = useConfig();
  const { availableDomains } = config.emailCallbacks;

  const { createEmailCallback } = useCreateEmailCallback();

  const { form, Field, Form, createFormError } = createForm({
    schema: v.object({
      username: v.pipe(
        v.string(),
        v.regex(emailUsernameRegex, 'Username must be alphanumeric and can contain dashes, dots and underscores (but not at the beginning or end)'),
        v.minLength(3, 'Username must be at least 3 characters long'),
      ),
      domain: v.pipe(
        v.picklist(availableDomains, 'Invalid domain'),
      ),
      webhookUrl: v.pipe(
        v.string(),
        v.nonEmpty('Please enter the webhook URL'),
        v.url('Please enter a valid URL'),
      ),
      webhookSecret: v.pipe(
        v.string(),
        v.nonEmpty('Please enter a valid secret'),
        v.minLength(16, 'Secret must be at least 16 characters long'),
      ),

    }),
    initialValues: {
      domain: availableDomains[0],
      username: generateId(),
    },
    onSubmit: async ({ username, domain, webhookUrl, webhookSecret }) => {
      const [, error] = await safely(createEmailCallback({
        domain,
        username,
        allowedOrigins: [],
        webhookUrl,
        webhookSecret,
      }));

      if (isHttpErrorWithCode({ error, code: 'email_callbacks.already_exists' })) {
        throw createFormError({
          message: 'Unable to create email',
          fields: {
            username: 'An email with this username already exists',
          },
        });
      }

      if (error) {
        throw createFormError({
          message: 'An error has occurred, please try again',
        });
      }
    },
  });

  return (
    <Dialog open={isModalOpen()} onOpenChange={setIsModalOpen}>
      <DialogTrigger as={props.children} />
      <DialogContent>
        <DialogTitle>Create email</DialogTitle>
        <Form>
          <label for="username" class="text-sm font-medium mb-1">Email</label>

          <div class="flex items-center gap-2">

            <Field name="username">
              {(field, inputProps) => (
                <TextFieldRoot class="flex flex-col gap-1 flex-1">
                  <div class="border border-input rounded-md flex items-center pr-1 mt-1">

                    <TextField
                      class="border-none shadow-none focus-visible:ring-none"
                      type="text"
                      id="username"
                      placeholder="eg. john.doe"
                      {...inputProps}
                      autoFocus
                      value={field.value}
                      aria-invalid={Boolean(field.error)}
                    />
                    <Button
                      class="text-base size-9 p-0 text-muted-foreground hover:text-primary transition"
                      variant="link"
                      onClick={() => setValue(form, 'username', generateId())}
                    >
                      <div class="i-tabler-refresh size-4"></div>
                    </Button>
                  </div>
                </TextFieldRoot>
              )}
            </Field>

            <Field name="domain">
              {(field, inputProps) => (
                <Select
                  options={availableDomains}
                  placeholder="Select domain"
                  itemComponent={props => (
                    <SelectItem item={props.item}>{props.item.rawValue as string}</SelectItem>
                  )}
                  class="flex-1 mt-1"
                  defaultValue={field.value}
                  onChange={e => inputProps.onChange(e)}
                >
                  <SelectTrigger>
                    <SelectValue<string>>{state => `@${state.selectedOption()}`}</SelectValue>
                  </SelectTrigger>
                  <SelectContent />
                </Select>
              )}
            </Field>
          </div>

          {getError(form, 'username') && <div class="text-red-500 text-sm">{getError(form, 'username')}</div>}

          <Field name="webhookUrl">
            {(field, inputProps) => (
              <TextFieldRoot class="flex flex-col gap-1 mt-4">
                <TextFieldLabel for="webhookUrl">Webhook URL</TextFieldLabel>
                <TextField type="text" id="webhookUrl" placeholder="eg. https://example.com/callback" {...inputProps} autoFocus value={field.value} aria-invalid={Boolean(field.error)} />
                {field.error && <div class="text-red-500 text-sm">{field.error}</div>}
              </TextFieldRoot>
            )}
          </Field>

          <Field name="webhookSecret">
            {(field, inputProps) => (
              <TextFieldRoot class="flex flex-col gap-1 mt-4">
                <TextFieldLabel for="webhookSecret">Webhook Secret</TextFieldLabel>

                <div class="border border-input rounded-md flex items-center pr-1 mt-1">
                  <TextField
                    type="text"
                    id="webhookSecret"
                    placeholder="eg. my-secret-key"
                    {...inputProps}
                    autoFocus
                    value={field.value}
                    aria-invalid={Boolean(field.error)}
                    class="border-none shadow-none focus-visible:ring-none"
                  />
                  <Button
                    class="text-base size-9 p-0 text-muted-foreground hover:text-primary transition"
                    variant="link"
                    onClick={() => setValue(form, 'webhookSecret', generateEmailCallbackSecret())}
                  >
                    <div class="i-tabler-refresh size-4"></div>
                  </Button>
                </div>
                {field.error && <div class="text-red-500 text-sm">{field.error}</div>}
              </TextFieldRoot>
            )}
          </Field>

          <div class="flex gap-2 mt-4 justify-between">
            <div class="text-red-500 text-sm mt-2">{form.response.message}</div>

            <div>
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit">Create email</Button>
            </div>
          </div>

        </Form>

        {/* <Show when={!form.invalid && form.dirty}>
          <Alert>
            <AlertTitle>Summary</AlertTitle>
            <AlertDescription>
              Emails sent to
              {' '}
              <code class="font-mono bg-muted border px-1 py-0.5 rounded-md">
                {`${getValue(form, 'username')}@${getValue(form, 'domain')}`}
              </code>
              {' '}
              will trigger a HTTP POST request to
              {' '}
              <code class="font-mono bg-muted border px-1 py-0.5 rounded-md">
                {getValue(form, 'webhookUrl')}
              </code>
              .
            </AlertDescription>
          </Alert>
        </Show> */}
      </DialogContent>
    </Dialog>
  );
};

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
            <EmailCallbackModal>
              {props => (
                <Button class="gap-2" {...props}>
                  <div class="i-tabler-plus size-4"></div>
                  Create email
                </Button>
              )}
            </EmailCallbackModal>
          </div>
        </Match>
        <Match when={query.data?.emailCallbacks.length}>

          <div class="flex flex-row gap-2 mb-2 justify-between items-center">
            <div class="text-base font-medium">
              Your emails
            </div>

            <EmailCallbackModal>
              {props => (
                <Button class="gap-2" {...props}>
                  <div class="i-tabler-plus size-4"></div>
                  Create new email
                </Button>
              )}
            </EmailCallbackModal>
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
