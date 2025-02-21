/* @refresh reload */

import type { ConfigColorMode } from '@kobalte/core/color-mode';
import { ColorModeProvider } from '@kobalte/core/color-mode';
import { Router } from '@solidjs/router';
import { QueryClientProvider } from '@tanstack/solid-query';

import { render, Suspense } from 'solid-js/web';
import { ConfigProvider } from './modules/config/config.provider';
import { I18nProvider } from './modules/i18n/i18n.provider';
import { ConfirmModalProvider } from './modules/shared/confirm';
import { queryClient } from './modules/shared/query/query-client';
import { IdentifyUser } from './modules/tracking/components/identify-user.component';
import { PageViewTracker } from './modules/tracking/components/pageview-tracker.component';
import { Toaster } from './modules/ui/components/sonner';
import { routes } from './routes';
import '@unocss/reset/tailwind.css';
import 'virtual:uno.css';
import './app.css';

render(
  () => {
    const initialColorMode: ConfigColorMode = 'light';
    // const colorModeStorageKey = 'owlrelay_color_mode';
    // const localStorageManager = createLocalStorageManager(colorModeStorageKey);

    return (
      <Router
        children={routes}
        root={props => (
          <QueryClientProvider client={queryClient}>
            <Suspense>
              <I18nProvider>
                <ConfirmModalProvider>
                  {/* <ColorModeScript storageType={localStorageManager.type} storageKey={colorModeStorageKey} initialColorMode={initialColorMode} /> */}
                  <ColorModeProvider
                    initialColorMode={initialColorMode}
                    // storageManager={localStorageManager}
                  >
                    <Toaster />
                    <IdentifyUser />
                    <PageViewTracker />

                    <ConfigProvider>
                      <div class="min-h-screen font-sans text-sm font-normal">
                        {props.children}
                      </div>
                    </ConfigProvider>

                  </ColorModeProvider>

                </ConfirmModalProvider>
              </I18nProvider>
            </Suspense>
          </QueryClientProvider>
        )}
      />
    );
  },
  document.getElementById('root')!,
);
