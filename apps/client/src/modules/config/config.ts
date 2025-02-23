export const isDev = import.meta.env.MODE === 'development';

const asBoolean = (value: string | undefined, defaultValue: boolean) => value === undefined ? defaultValue : value.trim().toLowerCase() === 'true';
function asString<T extends string | undefined>(value: string | undefined, defaultValue?: T): T extends undefined ? string | undefined : string {
  return (value ?? defaultValue) as T extends undefined ? string | undefined : string;
}

function asStringArray(value: string | undefined, defaultValue?: string[]): string[] {
  return value?.split(',') ?? defaultValue ?? [];
}

export const buildTimeConfig = {
  baseUrl: asString(import.meta.env.VITE_BASE_URL, window.location.origin),
  baseApiUrl: asString(import.meta.env.VITE_BASE_API_URL, window.location.origin),
  vitrineBaseUrl: asString(import.meta.env.VITE_VITRINE_BASE_URL, 'https://owlrelay.email'),
  auth: {
    isRegistrationEnabled: asBoolean(import.meta.env.VITE_AUTH_IS_REGISTRATION_ENABLED, false),
    isPasswordResetEnabled: asBoolean(import.meta.env.VITE_AUTH_IS_PASSWORD_RESET_ENABLED, false),
    isEmailVerificationRequired: asBoolean(import.meta.env.VITE_AUTH_IS_EMAIL_VERIFICATION_REQUIRED, false),
    showLegalLinksOnAuthPage: asBoolean(import.meta.env.VITE_AUTH_SHOW_LEGAL_LINKS_ON_AUTH_PAGE, true),
    providers: {
      github: { isEnabled: asBoolean(import.meta.env.VITE_AUTH_PROVIDERS_GITHUB_IS_ENABLED, false) },
      google: { isEnabled: asBoolean(import.meta.env.VITE_AUTH_PROVIDERS_GOOGLE_IS_ENABLED, false) },
    },
  },
  emailCallbacks: {
    availableDomains: asStringArray(import.meta.env.VITE_EMAIL_CALLBACKS_AVAILABLE_DOMAINS),
  },
  posthog: {
    apiKey: asString(import.meta.env.VITE_POSTHOG_API_KEY),
    host: asString(import.meta.env.VITE_POSTHOG_HOST),
    isEnabled: asBoolean(import.meta.env.VITE_POSTHOG_ENABLED, false),
  },
} as const;

export type Config = typeof buildTimeConfig;
export type RuntimePublicConfig = Pick<Config, 'auth'>;
