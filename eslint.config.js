import js from '@eslint/js'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      '.next/',
      'next-env.d.ts',
      'node_modules/',
      'public/',
      'playwright-report/',
      'test-results/',
      '.vercel/',
      // Snapshot of the reverted hero-brain work, kept for reference only. It
      // is gitignored and never built, and its modules import siblings that no
      // longer exist, so linting it only produces noise.
      'brain-archive/',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.tsx'],
    ...jsxA11y.flatConfigs.recommended,
  },
  {
    files: ['**/*.tsx'],
    ...react.configs.flat.recommended,
    settings: { react: { version: 'detect' } },
  },
  {
    files: ['**/*.tsx'],
    rules: {
      // New JSX transform: no React import needed.
      'react/react-in-jsx-scope': 'off',
      // The vanilla-script architecture passes trusted static *Html strings.
      'react/no-danger': 'off',
      // Copy lives in typed content files; the few JSX literals read better
      // with real apostrophes than with &apos; entities.
      'react/no-unescaped-entities': 'off',
    },
  },
  {
    // React Three Fiber elements use three.js props unknown to the DOM.
    files: ['src/components/three/**'],
    rules: {
      'react/no-unknown-property': 'off',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
    },
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
