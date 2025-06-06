import type { FormErrors, FormProps, PartialValues } from '@modular-forms/solid';
import type * as v from 'valibot';
import { createForm as createModularForm, FormError, valiForm } from '@modular-forms/solid';
import { createHook } from '../hooks/hooks';

export function createForm<Schema extends v.ObjectSchema<any, any>>({
  schema,
  initialValues,
  onSubmit,
}: {
  schema: Schema;
  initialValues?: PartialValues<v.InferInput<Schema>>;
  onSubmit?: (values: v.InferInput<Schema>) => Promise<void>;
}) {
  const submitHook = createHook<v.InferInput<Schema>>();

  if (onSubmit) {
    submitHook.on(onSubmit);
  }

  const [form, { Form, Field, FieldArray }] = createModularForm<v.InferInput<Schema>>({
    validate: valiForm(schema),
    initialValues,
  });

  return {
    form,
    Form: (props: Omit<FormProps<v.InferInput<Schema>, undefined>, 'of'>) => Form({ ...props, onSubmit: submitHook.trigger }),
    Field,
    FieldArray,
    onSubmit: submitHook.on,
    submit: submitHook.trigger,
    createFormError: ({ message, fields }: { message?: string; fields?: FormErrors<v.InferInput<Schema>> }) => {
      if (message && fields) {
        return new FormError<v.InferInput<Schema>>(message, fields);
      }

      if (message) {
        return new FormError<v.InferInput<Schema>>(message);
      }

      if (fields) {
        return new FormError<v.InferInput<Schema>>(fields);
      }

      return new FormError<v.InferInput<Schema>>('Unknown error');
    },
  };
}
