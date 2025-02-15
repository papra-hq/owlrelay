import type { RouteDefinition } from '@solidjs/router';
import { createProtectedPage } from './modules/auth/middleware/protected-page.middleware';
import { EmailValidationRequiredPage } from './modules/auth/pages/email-validation-required.page';
import { LoginPage } from './modules/auth/pages/login.page';
import { RegisterPage } from './modules/auth/pages/register.page';
import { RequestPasswordResetPage } from './modules/auth/pages/request-password-reset.page';
import { ResetPasswordPage } from './modules/auth/pages/reset-password.page';
import { EmailsPage } from './modules/email-callbacks/pages/email-callbacks.page';
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
        component: createProtectedPage({ authType: 'private', component: EmailsPage }),
      },
      {
        path: '/settings',
        component: createProtectedPage({ authType: 'private', component: UserSettingsPage }),
      },
    ],
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
