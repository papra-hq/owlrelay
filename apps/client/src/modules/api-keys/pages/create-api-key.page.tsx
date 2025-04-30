import { useI18n } from '@/modules/i18n/i18n.provider';
import { createForm } from '@/modules/shared/form/form';
import { queryClient } from '@/modules/shared/query/query-client';
import { CopyButton } from '@/modules/shared/utils/copy';
import { Button } from '@/modules/ui/components/button';
import { TextField, TextFieldDescription, TextFieldLabel, TextFieldRoot } from '@/modules/ui/components/textfield';
import { A } from '@solidjs/router';
import { type Component, createSignal, Match, Switch } from 'solid-js';
import * as v from 'valibot';
import { createApiKey } from '../api-keys.services';

export const CreateApiKeyPage: Component = () => {
  const { t } = useI18n();
  const [getCreatedApiToken, setCreatedApiToken] = createSignal<string | null>(null);

  const { form, Field, Form } = createForm({
    schema: v.object({
      name: v.pipe(
        v.string(),
        v.trim(),
        v.nonEmpty(t('api-keys.create.name.required')),
        v.maxLength(128, t('api-keys.create.name.max-length')),
      ),
    }),
    onSubmit: async ({ name }) => {
      const { token } = await createApiKey({ name });

      setCreatedApiToken(token);

      await queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });

  return (
    <div class="mx-auto max-w-2xl pt-6 pb-32">

      <div class="border-b pb-4 mb-4 mx-6 pt-6 sm:pt-0 sm:mx-0">
        <Button as={A} href="/api-keys" variant="outline" class="mb-4">
          <div class="i-tabler-arrow-left size-4 mr-2"></div>
          Back
        </Button>

        <h1 class="text-xl font-bold">{t('api-keys.create.title')}</h1>
      </div>

      <Switch>

        <Match when={getCreatedApiToken()}>
          {token => (
            <div class="bg-card p-6 border rounded-lg">
              <h2 class="text-lg font-semibold">{t('api-keys.create.success.title')}</h2>
              <p class="text-sm text-muted-foreground">{t('api-keys.create.success.description')}</p>

              <TextFieldRoot class="mt-4 flex items-center gap-2 space-y-0">
                <TextField value={token()} readOnly />

                <CopyButton
                  text={token()}
                />
              </TextFieldRoot>
            </div>
          )}
        </Match>

        <Match when={!getCreatedApiToken()}>
          <Form>
            <div class="bg-card sm:rounded-lg p-6 border-y sm:border">
              <Field name="name">
                {(field, inputProps) => (
                  <TextFieldRoot class="flex flex-col gap-1">
                    <TextFieldLabel for="name" class="text-base font-semibold">{t('api-keys.create.name.label')}</TextFieldLabel>
                    <TextFieldDescription>{t('api-keys.create.name.description')}</TextFieldDescription>

                    <TextField
                      {...inputProps}
                      value={field.value}
                      aria-invalid={Boolean(field.error)}
                      type="text"
                      id="name"
                      placeholder={t('api-keys.create.name.placeholder')}
                    />
                    {field.error && <div class="text-red-500 text-sm">{field.error}</div>}
                  </TextFieldRoot>
                )}
              </Field>
            </div>

            <div class="flex justify-end mt-6">
              <Button
                type="submit"
                class="gap-2"
                disabled={form.invalid || form.submitting || !form.touched}
                isLoading={form.submitting}
              >
                {t('api-keys.create.submit')}
              </Button>
            </div>
          </Form>
        </Match>
      </Switch>
    </div>
  );
};
