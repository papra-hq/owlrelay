export const buildTimeConfig = {
  baseUrl: (import.meta.env.VITE_BASE_URL ?? window.location.origin) as string,
  baseApiUrl: (import.meta.env.VITE_BASE_API_URL ?? window.location.origin) as string,
  vitrineBaseUrl: (import.meta.env.VITE_VITRINE_BASE_URL ?? 'https://owlrelay.email') as string,
  auth: {
    isRegistrationEnabled: import.meta.env.VITE_AUTH_IS_REGISTRATION_ENABLED !== 'false',
    isPasswordResetEnabled: import.meta.env.VITE_AUTH_IS_PASSWORD_RESET_ENABLED !== 'false',
    isEmailVerificationRequired: import.meta.env.VITE_AUTH_IS_EMAIL_VERIFICATION_REQUIRED !== 'false',
    showLegalLinksOnAuthPage: import.meta.env.VITE_AUTH_SHOW_LEGAL_LINKS_ON_AUTH_PAGE === 'true',
    providers: {
      github: {
        isEnabled: import.meta.env.VITE_AUTH_PROVIDERS_GITHUB_IS_ENABLED === 'true',
      },
      google: {
        isEnabled: import.meta.env.VITE_AUTH_PROVIDERS_GOOGLE_IS_ENABLED === 'true',
      },
    },
  },
  emailCallbacks: {
    availableDomains: import.meta.env.VITE_EMAIL_CALLBACKS_AVAILABLE_DOMAINS?.split(',') ?? ['example.com', 'example.org'],
  },
} as const;

export type Config = typeof buildTimeConfig;
export type RuntimePublicConfig = Pick<Config, 'auth'>;
