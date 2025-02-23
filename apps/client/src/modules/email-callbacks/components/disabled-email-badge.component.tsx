import type { Component } from 'solid-js';
import { useI18n } from '@/modules/i18n/i18n.provider';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/modules/ui/components/tooltip';

export const DisabledEmailBadge: Component = () => {
  const { t } = useI18n();

  return (
    <Tooltip>
      <TooltipTrigger
        as="span"
        class="text-muted-foreground bg-muted text-xs px-2 py-1 rounded-md border leading-tight inline-flex flex-row gap-2 items-center"
      >
        <div class="i-tabler-alert-triangle size-3.5" />
        {t('email-callbacks.disabled.label')}
      </TooltipTrigger>
      <TooltipContent>
        {t('email-callbacks.disabled.tooltip')}
      </TooltipContent>
    </Tooltip>
  );
};
