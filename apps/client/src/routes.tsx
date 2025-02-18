import { Navigate, type RouteDefinition } from '@solidjs/router';
import { createProtectedPage } from './modules/auth/middleware/protected-page.middleware';
import { EmailValidationRequiredPage } from './modules/auth/pages/email-validation-required.page';
import { LoginPage } from './modules/auth/pages/login.page';
import { RegisterPage } from './modules/auth/pages/register.page';
import { RequestPasswordResetPage } from './modules/auth/pages/request-password-reset.page';
import { ResetPasswordPage } from './modules/auth/pages/reset-password.page';
import { EmailCallbackPage } from './modules/email-callbacks/pages/email-callback.page';
import { EmailsPage } from './modules/email-callbacks/pages/email-callbacks.page';
import { CheckoutCancelPage } from './modules/payments/pages/checkout-cancel.page';
import { CheckoutSuccessPage } from './modules/payments/pages/checkout-success.page';
import { NotFoundPage } from './modules/shared/pages/not-found.page';
import { AppLayout } from './modules/ui/layouts/app.layout';
import { UserSettingsPage } from './modules/users/pages/user-settings.page';

export const routes: RouteDefinition[] = [
  {
    path: '/',
    component: AppLayout,
    children: [
      {
        path: '/',
        component: () => <Navigate href="/email-callbacks" />,
      },
      {
        path: '/email-callbacks',
        component: createProtectedPage({ authType: 'private', component: EmailsPage }),
      },
      {
        path: '/email-callbacks/:emailCallbackId',
        component: EmailCallbackPage,
      },
      {
        path: '/settings',
        component: createProtectedPage({ authType: 'private', component: UserSettingsPage }),
      },
    ],
  },
  {
    path: '/checkout-success',
    component: CheckoutSuccessPage,
  },
  {
    path: '/checkout-cancel',
    component: CheckoutCancelPage,
  },
  {
    path: '/login',
    component: createProtectedPage({ authType: 'public-only', component: LoginPage }),
  },
  {
    path: '/register',
    component: createProtectedPage({ authType: 'public-only', component: RegisterPage }),
  },
  {
    path: '/reset-password',
    component: createProtectedPage({ authType: 'public-only', component: ResetPasswordPage }),
  },
  {
    path: '/request-password-reset',
    component: createProtectedPage({ authType: 'public-only', component: RequestPasswordResetPage }),
  },
  {
    path: '/email-validation-required',
    component: createProtectedPage({ authType: 'public-only', component: EmailValidationRequiredPage }),
  },
  {
    path: '*404',
    component: NotFoundPage,
  },
];
