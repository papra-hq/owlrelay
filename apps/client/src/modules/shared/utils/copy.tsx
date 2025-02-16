import type { ComponentProps, ParentComponent } from 'solid-js';
import { Button } from '@/modules/ui/components/button';
import { createToast } from '@/modules/ui/components/sonner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/modules/ui/components/tooltip';
import { createSignal } from 'solid-js';

export function useCopy() {
  const [getIsJustCopied, setIsJustCopied] = createSignal(false);

  const copy = ({ text }: { text: string }) => {
    navigator.clipboard.writeText(text).then(() => {
      setIsJustCopied(true);
      setTimeout(() => setIsJustCopied(false), 2000);
    });
  };

  return { copy, getIsJustCopied };
}

export const CopyButton: ParentComponent<{ text: string; label?: string; copiedLabel?: string } & ComponentProps<typeof Button>> = (props) => {
  const { copy, getIsJustCopied } = useCopy();

  return (
    <Button
      onClick={() => copy({ text: props.text })}
      {...props}
    >
      <div classList={{ 'i-tabler-copy': !getIsJustCopied(), 'i-tabler-check': getIsJustCopied() }} class="mr-2 text-lg" />
      {(getIsJustCopied() ? props.copiedLabel ?? 'Copied!' : props.children ?? props.label ?? 'Copy')}
    </Button>
  );
};

export const CopyIconButton: ParentComponent<{ text: string; toast?: string; tooltip?: string } & ComponentProps<typeof Button>> = (props) => {
  const { copy, getIsJustCopied } = useCopy();

  const handleClick = () => {
    copy({ text: props.text });

    if (props.toast) {
      createToast({
        message: props.toast,
        icon: <div class="i-tabler-copy size-5 text-muted-foreground mr-2" />,
      });
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger
        as={Button}
        onClick={handleClick}
        variant="ghost"
        size="icon"
        aria-label="Copy"
        {...props}
      >
        <div classList={{ 'i-tabler-copy': !getIsJustCopied(), 'i-tabler-check': getIsJustCopied() }} />
      </TooltipTrigger>
      <TooltipContent>{props.tooltip}</TooltipContent>
    </Tooltip>
  );
};
