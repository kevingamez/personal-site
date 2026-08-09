import js from '@eslint/js'
import astro from 'eslint-plugin-astro'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      'dist/',
      '.astro/',
      'node_modules/',
      'public/',
      'playwright-report/',
      'test-results/',
      '.vercel/',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs['flat/recommended'],
  ...astro.configs['flat/jsx-a11y-recommended'],
  {
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // Keyboard-focusable scrollable regions (role="region" + aria-label +
      // tabindex="0") are the canonical accessible pattern for carousels.
      'astro/jsx-a11y/no-noninteractive-tabindex': ['error', { roles: ['tabpanel', 'region'] }],
    },
  },
  {
    // Node contexts: build scripts, tooling, API functions, Playwright config.
    files: ['scripts/**', 'tools/**', 'api/**', 'playwright.config.ts', 'tests/**'],
    languageOptions: {
      globals: globals.node,
    },
  }
)
