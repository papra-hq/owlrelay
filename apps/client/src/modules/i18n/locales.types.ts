import type { translations as defaultTranslations } from '@/locales/en';

export type TranslationKeys = keyof typeof defaultTranslations;
export type TranslationsDictionary = Record<TranslationKeys, string>;

// legacy support
// export type LocaleKeys = TranslationKeys;
