import type { DropdownMenuTriggerProps } from '@kobalte/core/dropdown-menu';

import { useI18n } from '@/modules/i18n/i18n.provider';
import { getCheckoutUrl } from '@/modules/payments/payments.services';
import { cn } from '@/modules/shared/style/cn';
import { Button } from '@/modules/ui/components/button';
import { useThemeStore } from '@/modules/ui/theme/theme.store';
import { fetchCurrentUser } from '@/modules/users/users.services';
import { A } from '@solidjs/router';
import { createQuery } from '@tanstack/solid-query';
import { type Component, type ParentComponent, Show } from 'solid-js';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/dropdown-menu';

export const ThemeSwitcher: Component = () => {
  const themeStore = useThemeStore();

  return (
    <>
      <DropdownMenuItem onClick={() => themeStore.setColorMode({ mode: 'light' })} class="flex items-center gap-2 cursor-pointer">
        <div class="i-tabler-sun text-lg"></div>
        Light Mode
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => themeStore.setColorMode({ mode: 'dark' })} class="flex items-center gap-2 cursor-pointer">
        <div class="i-tabler-moon text-lg"></div>
        Dark Mode
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => themeStore.setColorMode({ mode: 'system' })} class="flex items-center gap-2 cursor-pointer">
        <div class="i-tabler-device-laptop text-lg"></div>
        System Mode
      </DropdownMenuItem>
    </>
  );
};

export const LanguageSwitcher: Component = () => {
  const { getLocale, setLocale, locales } = useI18n();
  const languageName = new Intl.DisplayNames(getLocale(), {
    type: 'language',
    languageDisplay: 'standard',
  });

  return (
    <>
      {locales.map(locale => (
        <DropdownMenuItem onClick={() => setLocale(locale.key)} class={cn('cursor-pointer', { 'font-bold': getLocale() === locale.key })}>
          <span translate="no" lang={getLocale() === locale.key ? undefined : locale.key}>
            {locale.name}
          </span>
          <Show when={getLocale() !== locale.key}>
            <span class="text-muted-foreground pl-1">
              (
              {languageName.of(locale.key)}
              )
            </span>
          </Show>
        </DropdownMenuItem>
      ))}
    </>
  );
};

export const AppLayout: ParentComponent = (props) => {
  const query = createQuery(() => ({
    queryKey: ['users', 'me'],
    queryFn: fetchCurrentUser,
  }));

  const getIsUserOnFreePlan = () => query.data?.user.planId === 'free';

  const openCheckout = async () => {
    const { checkoutUrl } = await getCheckoutUrl({ planId: 'pro' });
    window.open(checkoutUrl, '_blank');
  };

  return (
    <div class="flex flex-col min-h-screen">

      <div class="w-full h-64px bg-card border-b">
        <div class="max-w-1200px mx-auto flex flex-row items-center justify-between gap-2 h-full px-6">
          <A href="/" class="flex flex-row items-center gap-1 group">
            <div class="i-custom-owl size-6.5 group-hover:rotate-20deg transition-transform"></div>
            <span class="text-xl font-semibold">
              OwlRelay
            </span>
          </A>

          <div class="flex flex-row items-center gap-2">
            <Show when={getIsUserOnFreePlan()}>
              <Button variant="secondary" onClick={openCheckout}>
                Upgrade to Pro
              </Button>
            </Show>

            <DropdownMenu>
              <DropdownMenuTrigger as={(props: DropdownMenuTriggerProps) => (
                <Button variant="ghost" size="icon" {...props}>
                  <div class="i-tabler-user size-5"></div>
                </Button>
              )}
              />

              <DropdownMenuContent>
                <DropdownMenuItem>
                  <A href="/settings" class="flex flex-row items-center gap-2">
                    <div class="i-tabler-settings"></div>
                    Account settings
                  </A>
                </DropdownMenuItem>
              </DropdownMenuContent>

            </DropdownMenu>
          </div>
        </div>
      </div>

      <div class="flex-1">
        {props.children}
      </div>

      {/* <div class="w-full h-64px border-t">
        <div class="max-w-1200px mx-auto flex flex-row items-center justify-between gap-2 h-full px-6">
          <span class="text-sm text-muted-foreground">
            &copy;
            {' '}
            {new Date().getFullYear()}
            {' '}
            OwlRelay
          </span>

          <A href="/privacy" class="text-sm text-muted-foreground">

          </A>

        </div>
      </div> */}
    </div>
  );
};
