import { defineConfig } from 'oxfmt';

export default defineConfig({
  singleQuote: true,
  semi: true,
  trailingComma: 'all',
  printWidth: 200,
  sortPackageJson: true,
  arrowParens: 'avoid',
  insertFinalNewline: true,
  objectWrap: 'preserve',
  tabWidth: 2,
  useTabs: false,
  ignorePatterns: ['apps/client/src/modules/i18n/locales.types.ts'],
});
