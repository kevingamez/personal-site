import js from '@eslint/js'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      'dist/',
      '.next/',
      'next-env.d.ts',
      'node_modules/',
      'public/',
      'playwright-report/',
      'test-results/',
      '.vercel/',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.tsx'],
    ...jsxA11y.flatConfigs.recommended,
  },
  {
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['**/*.tsx'],
    rules: {
      // Keyboard-focusable scrollable regions (role="region" + aria-label +
      // tabindex="0") are the canonical accessible pattern for carousels.
      'jsx-a11y/no-noninteractive-tabindex': ['error', { roles: ['tabpanel', 'region'] }],
    },
  },
  {
    // Node contexts: build scripts, tooling, API routes, Playwright config.
    files: [
      'scripts/**',
      'tools/**',
      'api/**',
      'app/api/**',
      'next.config.ts',
      'playwright.config.ts',
      'tests/**',
      'src/data/**',
    ],
    languageOptions: {
      globals: globals.node,
    },
  }
)
