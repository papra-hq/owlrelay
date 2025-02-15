import {
  defineConfig,
  presetIcons,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss';
import presetAnimations from 'unocss-preset-animations';

export default defineConfig({
  presets: [
    presetUno({
      dark: {
        dark: '[data-kb-theme="dark"]',
        light: '[data-kb-theme="light"]',
      },
      prefix: '',
    }),
    presetAnimations(),
    presetWebFonts({
      provider: 'bunny',
      fonts: {
        sans: 'Inter:400,500,600,700,800,900',
      },
    }),
    presetIcons({
      collections: {
        custom: {
          owl: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M8.5 10q-.425 0-.712-.288T7.5 9t.288-.712T8.5 8t.713.288T9.5 9t-.288.713T8.5 10m7 0q-.425 0-.712-.288T14.5 9t.288-.712T15.5 8t.713.288T16.5 9t-.288.713T15.5 10M12 22q-3.35 0-5.675-2.325T4 14V9q0-3.05 2.4-5.025T12 2t5.6 1.975T20 9v10q0 .425-.288.713T19 20h-1q-1.25 0-2.125-.875T15 17v-.05q0-.5-.312-.75T14 15.95t-.687.25t-.313.75V17q0 1.2.525 2.225t1.4 1.7q.375.275.263.675t-.488.4zm0-8q2.375 0 4.188-1.388T18 9q0-.875-.3-1.638T16.85 6q-1.6.05-2.725 1.2T13 10q0 .425-.287.713T12 11t-.712-.288T11 10q0-1.65-1.125-2.775t-2.725-1.2q-.55.6-.85 1.35T6 9q0 2.225 1.813 3.613T12 14"/></svg>',
        },
      },
    }),
  ],
  transformers: [transformerVariantGroup(), transformerDirectives()],
  theme: {
    colors: {
      border: 'hsl(var(--border))',
      input: 'hsl(var(--input))',
      ring: 'hsl(var(--ring))',
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
      primary: {
        DEFAULT: 'hsl(var(--primary))',
        foreground: 'hsl(var(--primary-foreground))',
      },
      secondary: {
        DEFAULT: 'hsl(var(--secondary))',
        foreground: 'hsl(var(--secondary-foreground))',
      },
      destructive: {
        DEFAULT: 'hsl(var(--destructive))',
        foreground: 'hsl(var(--destructive-foreground))',
      },
      warning: {
        DEFAULT: 'hsl(var(--warning))',
        foreground: 'hsl(var(--warning-foreground))',
      },
      muted: {
        DEFAULT: 'hsl(var(--muted))',
        foreground: 'hsl(var(--muted-foreground))',
      },
      accent: {
        DEFAULT: 'hsl(var(--accent))',
        foreground: 'hsl(var(--accent-foreground))',
      },
      popover: {
        DEFAULT: 'hsl(var(--popover))',
        foreground: 'hsl(var(--popover-foreground))',
      },
      card: {
        DEFAULT: 'hsl(var(--card))',
        foreground: 'hsl(var(--card-foreground))',
      },
    },
    borderRadius: {
      lg: 'var(--radius)',
      md: 'calc(var(--radius) - 2px)',
      sm: 'calc(var(--radius) - 4px)',
    },
    animation: {
      keyframes: {
        'accordion-down':
          '{ from { height: 0 } to { height: var(--kb-accordion-content-height) } }',
        'accordion-up':
          '{ from { height: var(--kb-accordion-content-height) } to { height: 0 } }',
        'collapsible-down':
          '{ from { height: 0 } to { height: var(--kb-collapsible-content-height) } }',
        'collapsible-up':
          '{ from { height: var(--kb-collapsible-content-height) } to { height: 0 } }',
        'caret-blink': '{ 0%,70%,100% { opacity: 1 } 20%,50% { opacity: 0 } }',
      },
      timingFns: {
        'accordion-down': 'ease-out',
        'accordion-up': 'ease-out',
        'collapsible-down': 'ease-out',
        'collapsible-up': 'ease-out',
        'caret-blink': 'ease-out',
      },
      durations: {
        'accordion-down': '0.2s',
        'accordion-up': '0.2s',
        'collapsible-down': '0.2s',
        'collapsible-up': '0.2s',
        'caret-blink': '1.25s',
      },
      counts: {
        'caret-blink': 'infinite',
      },
    },
  },
  // safelist: [...ssoProviders.map(p => p.icon)],
});
