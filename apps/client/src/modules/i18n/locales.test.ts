import { describe, expect, test } from 'vitest';
import { glob, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { locales as registeredLocales } from './i18n.constants';

const rawLocales = import.meta.glob('../../locales/*.ts', { eager: true, import: 'translations' });
const locales = Object.fromEntries(Object.entries(rawLocales).map(([key, value]: [string, any]) => [key.replace('../../locales/', '').replace('.ts', ''), value]));

const { en: defaultLocal } = locales;

const clientPackageRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

describe('locales', () => {
  test('all registered locales must have a translation file', () => {
    const availableLocales = Object.keys(locales).toSorted();
    const registeredLocalesKeys = registeredLocales.map(x => x.key).toSorted();

    expect(registeredLocalesKeys).to.eql(availableLocales);
  });

  for (const [locale, translations] of Object.entries(locales)) {
    describe(locale, () => {
      test(`locale ${locale} must not have extra keys compared to default`, () => {
        const extraKeys = Object.keys(translations).filter(key => !(key in defaultLocal));

        expect(extraKeys).to.eql([], `Extra keys found in ${locale}`);
      });

      test(`all translations in ${locale} must be strings`, () => {
        const nonStringTranslations = Object.entries(translations)
          .filter(([, value]) => typeof value !== 'string')
          .map(([key]) => key);

        expect(nonStringTranslations).to.eql([], `Non-string translations found in ${locale}`);
      });
    });
  }

  test('all keys in en dict must be used in the app (dynamic keys are manually excluded)', async () => {
    const srcFileNames = await Array.fromAsync(
      glob('src/**/*.{ts,tsx}', {
        cwd: clientPackageRoot,
        exclude: ['src/**/*.test.*', 'src/modules/i18n/locales.types.ts', 'src/locales/*.ts'],
      }),
    );

    // Exclude keys that are used in dynamic contexts
    const dynamicKeysMatchers = [/^processing\.error\.[a-z0-9-]+$/];

    const keys = new Set(Object.keys(defaultLocal).filter(key => !dynamicKeysMatchers.some(matcher => matcher.test(key))));

    for (const srcFileName of srcFileNames) {
      const fileContent = await readFile(join(clientPackageRoot, srcFileName), 'utf-8');

      for (const key of keys) {
        if (fileContent.includes(key)) {
          keys.delete(key);
        }
      }

      if (keys.size === 0) {
        break;
      }
    }

    expect([...keys]).to.eql([], 'Unused keys found in en dictionnary, please remove them (or add them to the dynamic keys matchers in locales.test.ts if they are used in dynamic contexts)');
  });
});
