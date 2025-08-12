import type { DialogTriggerProps } from '@kobalte/core/dialog';
import { useI18n } from '@/modules/i18n/i18n.provider';
import { cn } from '@/modules/shared/style/cn';
import { Button } from '@/modules/ui/components/button';
import { Dialog, DialogContent, DialogTrigger } from '@/modules/ui/components/dialog';
import { type Component, createSignal, type JSX } from 'solid-js';
import { getCheckoutUrl } from '../payments.services';

export const GoProDialog: Component<{ children: (props: DialogTriggerProps) => JSX.Element }> = (props) => {
  const { t } = useI18n();
  const [getIsOpen, setIsOpen] = createSignal(false);
  const [getIsLoading, setIsLoading] = createSignal(false);

  const openCheckout = async () => {
    setIsLoading(true);
    const { checkoutUrl } = await getCheckoutUrl({ planId: 'pro' });
    window.open(checkoutUrl, '_blank');
    setIsLoading(false);
  };

  const getPlans = () => [
    {
      label: t('payments.plans.features.max-emails'),
      free: t('payments.plans.free.max-emails'),
      pro: t('payments.plans.pro.max-emails'),
    },
    {
      label: t('payments.plans.features.ingestion-limit'),
      free: t('payments.plans.features.unlimited'),
      pro: t('payments.plans.features.unlimited'),
    },
    {
      label: t('payments.plans.features.invocation-retention-days'),
      free: t('payments.plans.free.retention-days'),
      pro: t('payments.plans.pro.retention-days'),
    },
    {
      label: t('payments.plans.features.support'),
      free: t('payments.plans.free.support'),
      pro: t('payments.plans.pro.support'),
    },

  ];

  return (
    <Dialog open={getIsOpen()} onOpenChange={setIsOpen}>
      <DialogTrigger as={props.children} />

      <DialogContent class="max-w-2xl">
        <div>
          <h2 class="text-lg font-semibold text-foreground mb-0 pb-0">
            {t('payments.go-pro.title')}
          </h2>

          <p class="text-sm text-muted-foreground mt-0 pt-0 text-sm">
            {t('payments.go-pro.description')}
          </p>
        </div>

        <table class="w-full border-collapse border-spacing-0 mb-4">
          <thead>
            <tr class="text-sm">
              <th></th>
              <th class="px-4 py-2 text-left">
                { t('payments.plans.free.name')}
                <div class="text-muted-foreground font-normal">{t('payments.plans.free.price')}</div>
              </th>
              <th class="px-4 py-2 text-left bg-muted rounded-t-lg">
                { t('payments.plans.pro.name')}
                <div class="text-muted-foreground font-normal">{t('payments.plans.pro.price')}</div>
              </th>
            </tr>
          </thead>

          <tbody class="text-sm">
            {getPlans().map((plan, i) => (
              <tr class="border-t">
                <td class="text-left py-2">{plan.label}</td>
                <td class="px-4 py-2 text-muted-foreground">{plan.free}</td>
                <td class={cn('px-4 py-2 bg-muted', i === getPlans().length - 1 && 'rounded-b-lg')}>{plan.pro}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div class="rounded-lg bg-muted p-4 text-muted-foreground text-sm mb-4 lh-tight">
          {t('payments.go-pro.sponsor-us')}
          <Button variant="link" as="a" href="https://github.com/sponsors/papra-hq" target="_blank" class="ml-2 h-auto p-0 text-muted-foreground hover:text-foreground underline">
            <span>{t('payments.go-pro.sponsor-us-link')}</span>
          </Button>
        </div>

        <div class="flex flex-row gap-2 justify-between">
          <Button variant="link" as="a" href="https://owlrelay.email/contact" target="_blank" class="p-0 text-muted-foreground font-normal">
            {t('payments.go-pro.contact-us')}
          </Button>

          <div class="flex flex-row gap-2">
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              {t('payments.go-pro.cancel')}
            </Button>

            <Button onClick={openCheckout} class="gap-2" disabled={getIsLoading()}>
              {t('payments.go-pro.checkout')}
              <div class={cn('size-4', getIsLoading() ? 'i-tabler-loader-2 animate-spin' : 'i-tabler-arrow-right')} />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
