import type { EmailCallback } from '../email-callbacks.types';
import { useConfig } from '@/modules/config/config.provider';
import { useI18n } from '@/modules/i18n/i18n.provider';
import { createForm } from '@/modules/shared/form/form';
import { isHttpErrorWithCode } from '@/modules/shared/http/http-errors';
import { CopyButton } from '@/modules/shared/utils/copy';
import { Button } from '@/modules/ui/components/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/modules/ui/components/select';
import { TextField, TextFieldLabel, TextFieldRoot } from '@/modules/ui/components/textfield';
import { safely } from '@corentinth/chisels';
import { generateId } from '@corentinth/friendly-ids';
import { insert, remove, setValue } from '@modular-forms/solid';
import { A } from '@solidjs/router';
import { type Component, createSignal, For, Match, Switch } from 'solid-js';
import * as v from 'valibot';
import { emailUsernameRegex } from '../email-callbacks.constants';
import { formatEmailAddress, generateEmailCallbackSecret } from '../email-callbacks.models';
import { createEmailCallback } from '../email-callbacks.services';

export const CreateEmailCallbackPage: Component = () => {
  const { config } = useConfig();
  const [getCreatedEmailCallback, setCreatedEmailCallback] = createSignal<EmailCallback | null>(null);
  const { t } = useI18n();

  const { availableDomains } = config.emailCallbacks;

  const { form, Field, Form, createFormError, FieldArray } = createForm({
    schema: v.object({
      username: v.pipe(
        v.string(),
        v.nonEmpty(t('email-callbacks.form.validation.username.required')),
        v.regex(/^[\w-]+$/, t('email-callbacks.form.validation.username.invalid')),
        v.regex(emailUsernameRegex, t('email-callbacks.form.validation.username.invalid-characters')),
        v.minLength(3, t('email-callbacks.form.validation.username.min-length')),
      ),
      domain: v.pipe(
        v.picklist(availableDomains, t('email-callbacks.form.validation.domain.invalid')),
      ),
      webhookUrl: v.pipe(
        v.string(),
        v.nonEmpty(t('email-callbacks.form.validation.webhook-url.required')),
        v.url(t('email-callbacks.form.validation.webhook-url.invalid')),
      ),
      webhookSecret: v.union(
        [
          v.pipe(
            v.string(),
            v.minLength(16, t('email-callbacks.form.validation.webhook-secret.min-length')),
          ),
          // When not set, the secret is an empty string
          v.literal(''),
        ],
      ),
      allowedOrigins: v.optional(
        v.array(
          v.pipe(
            v.string(),
            v.email(t('email-callbacks.form.validation.allowed-origins.invalid')),
          ),
        ),
      ),
    }),
    initialValues: {
      domain: availableDomains[0],
      username: generateId(),
      allowedOrigins: [],
    },
    onSubmit: async ({ username, domain, webhookUrl, webhookSecret, allowedOrigins = [] }) => {
      const [result, error] = await safely(createEmailCallback({
        domain,
        username,
        allowedOrigins,
        webhookUrl,
        webhookSecret: webhookSecret === '' ? undefined : webhookSecret,
      }));

      if (isHttpErrorWithCode({ error, code: 'email_callbacks.already_exists' })) {
        throw createFormError({
          message: t('email-callbacks.form.validation.already-exists'),
        });
      }

      if (isHttpErrorWithCode({ error, code: 'email_callbacks.limit_reached' })) {
        throw createFormError({
          message: t('email-callbacks.form.validation.limit-reached'),
        });
      }

      if (error) {
        throw createFormError({
          message: t('email-callbacks.form.validation.unknown'),
        });
      }

      const { emailCallback } = result;

      setCreatedEmailCallback(emailCallback);
    },
  });

  return (
    <div class="sm:p-6 max-w-2xl mx-auto pb-30">
      <Switch>

        <Match when={getCreatedEmailCallback()}>
          {getEmailCallback => (
            <div class="p-6 mx-auto max-w-md text-center">
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
          <Form class="flex flex-col gap-4">

            <div class="bg-card sm:rounded-lg p-6 border-y sm:border">
              <div class="flex items-center justify-between gap-2  mb-4">
                <div>
                  <h2 class="text-base font-semibold">{t('email-callbacks.form.address.title')}</h2>
                  <p class="text-sm text-muted-foreground">
                    {t('email-callbacks.form.address.description')}
                  </p>
                </div>
                <div>
                  <Button
                    variant="outline"
                    onClick={() => setValue(form, 'username', generateId())}
                    class="flex-shrink-0 gap-2 hidden sm:flex"
                  >
                    <div class="i-tabler-refresh size-4 flex-shrink-0"></div>
                    {t('email-callbacks.form.address.random-address')}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setValue(form, 'username', generateId())}
                    class="flex-shrink-0 gap-2 sm:hidden"
                    size="icon"
                  >
                    <div class="i-tabler-refresh size-4"></div>
                  </Button>
                </div>
              </div>

              <div class="flex flex-col gap-2">
                <Field name="username">
                  {(field, inputProps) => (
                    <TextFieldRoot>
                      <TextFieldLabel class="sr-only">Email address</TextFieldLabel>

                      <div class="border border-input rounded-md flex items-center pr-1 mt-1 focus-within:(outline-none ring-1.5 ring-ring)">

                        <TextField
                          class="border-none shadow-none focus-visible:ring-none pr-0"
                          type="text"
                          id="username"
                          placeholder={t('email-callbacks.form.address.placeholder')}
                          {...inputProps}
                          autoFocus
                          value={field.value}
                          aria-invalid={Boolean(field.error)}
                          autoComplete="off"
                          autoCapitalize="off"
                          autoCorrect="off"
                          spellCheck="false"
                          data-1p-ignore
                          data-lpignore="true"
                          data-protonpass-ignore="true"
                        />

                        <Field name="domain">
                          {(field, inputProps) => (
                            <TextFieldRoot>
                              <Select
                                options={availableDomains}
                                placeholder="Select domain"
                                itemComponent={props => (
                                  <SelectItem item={props.item}>{props.item.rawValue as string}</SelectItem>
                                )}
                                defaultValue={field.value}
                                onChange={e => inputProps.onChange(e)}
                              >
                                <SelectTrigger
                                  class="border-none shadow-none  text-muted-foreground px-0 py-1 h-auto"
                                >
                                  <SelectValue<string>>{state => `@${state.selectedOption()}`}</SelectValue>
                                </SelectTrigger>
                                <SelectContent />
                              </Select>
                            </TextFieldRoot>
                          )}
                        </Field>

                      </div>
                      {field.error && <div class="text-red-500 text-sm">{field.error}</div>}

                    </TextFieldRoot>
                  )}
                </Field>

              </div>
            </div>

            <div class="bg-card sm:rounded-lg p-6 border-y sm:border">
              <div class="flex items-center justify-between gap-2  mb-4">
                <div>
                  <h2 class="text-base font-semibold ">{t('email-callbacks.form.webhook.title')}</h2>
                  <p class="text-sm text-muted-foreground">
                    {t('email-callbacks.form.webhook.description')}
                  </p>
                </div>
              </div>

              <Field name="webhookUrl">
                {(field, inputProps) => (
                  <TextFieldRoot class="flex flex-col gap-1 mt-6">
                    <TextFieldLabel for="webhookUrl">{t('email-callbacks.form.webhook.url.label')}</TextFieldLabel>
                    <TextField
                      type="text"
                      id="webhookUrl"
                      placeholder={t('email-callbacks.form.webhook.url.placeholder')}
                      {...inputProps}
                      value={field.value}
                      aria-invalid={Boolean(field.error)}
                    />
                    {field.error && <div class="text-red-500 text-sm">{field.error}</div>}
                  </TextFieldRoot>
                )}
              </Field>

              <Field name="webhookSecret">
                {(field, inputProps) => (
                  <TextFieldRoot class="flex flex-col gap-1 mt-6">
                    <TextFieldLabel for="webhookSecret" class="flex items-baseline gap-2">
                      {t('email-callbacks.form.webhook.secret.label')}

                      <span class="bg-background text-xs leading-tight px-1.5 py-0.5 rounded border text-muted-foreground">
                        {t('email-callbacks.form.recommended')}
                      </span>
                    </TextFieldLabel>

                    <div class="flex items-center gap-2">
                      <TextField
                        type="text"
                        id="webhookSecret"
                        placeholder={t('email-callbacks.form.webhook.secret.placeholder')}
                        {...inputProps}
                        value={field.value}
                        aria-invalid={Boolean(field.error)}
                      />
                      <Button
                        class="flex-shrink-0"
                        variant="outline"
                        size="icon"
                        onClick={() => setValue(form, 'webhookSecret', generateEmailCallbackSecret())}
                      >
                        <div class="i-tabler-refresh size-4"></div>
                      </Button>
                    </div>
                    {field.error && <div class="text-red-500 text-sm">{field.error}</div>}
                  </TextFieldRoot>
                )}
              </Field>
            </div>

            <div class="bg-card sm:rounded-lg p-6 border-y sm:border">
              <div class="flex items-center justify-between gap-2  mb-4">
                <div>
                  <h2 class="text-base font-semibold ">{t('email-callbacks.form.allowed-origins.title')}</h2>
                  <p class="text-sm text-muted-foreground">{t('email-callbacks.form.allowed-origins.description')}</p>
                </div>
              </div>

              <FieldArray name="allowedOrigins">
                {fieldArray => (
                  <div>

                    <For each={fieldArray.items}>
                      {(_, index) => (
                        <>
                          <div class="flex gap-2 w-full mb-2">
                            <Field
                              name={`allowedOrigins.${index()}`}
                            >
                              {(field, props) => (
                                <TextFieldRoot class="flex flex-col gap-1 flex-1">
                                  <TextField
                                    type="email"
                                    id="allowedOrigins"
                                    placeholder={t('email-callbacks.form.allowed-origins.placeholder')}
                                    {...props}
                                    value={field.value}
                                    aria-invalid={Boolean(field.error)}
                                  />
                                  {field.error && <div class="text-red-500 text-sm">{field.error}</div>}
                                </TextFieldRoot>
                              )}
                            </Field>

                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => remove(form, 'allowedOrigins', { at: index() })}
                              aria-label={t('email-callbacks.form.allowed-origins.remove-email')}
                            >
                              <div class="i-tabler-x size-4"></div>
                            </Button>
                          </div>

                        </>

                      )}
                    </For>

                    <Button
                      variant="outline"
                      onClick={() => insert(form, 'allowedOrigins', { value: '' })}
                      class="gap-2"
                    >
                      <div class="i-tabler-plus size-4"></div>
                      {t('email-callbacks.form.allowed-origins.add-email')}
                    </Button>

                    {fieldArray.error && <div class="text-red-500 text-sm">{fieldArray.error}</div>}

                  </div>
                )}
              </FieldArray>
            </div>

            <div class="flex gap-2 mt-4 justify-between items-center px-6 sm:px-0">
              <div class="text-red-500 text-sm mt-2">{form.response.message}</div>

              <div class="flex gap-2 flex-shrink-0">
                <Button
                  type="submit"
                  disabled={form.submitting}
                  isLoading={form.submitting}
                >
                  {t('email-callbacks.form.create-email')}
                </Button>
              </div>
            </div>
          </Form>
        </Match>
      </Switch>
    </div>
  );
};
