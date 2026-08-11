# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev           # Next dev server at localhost:3000
npm run build         # Production build (next build)
npm run preview       # Serve the production build at 127.0.0.1:4321
npm run check         # Type-check (tsc --noEmit)
npm run lint          # ESLint (typescript-eslint + jsx-a11y)
npm run format        # Apply Prettier
npm run format:check  # Verify formatting (CI)
npm test              # Playwright smoke tests (builds, then serves on :4321)
```

Always run `npm run check`, `npm run lint`, `npm run format:check`, and `npm test` before pushing.

## Architecture Overview

Personal portfolio site built with **Next.js 16 (App Router, React 19)**, deployed on **Vercel**. Bilingual (EN/ES). Vela visual system: paper `#F4F4F2`, ink `#0B0B0C`, violet `#7C5CFF` as the only interactive accent; Archivo + Instrument Serif Italic + JetBrains Mono (Google Fonts).

### Routing

Three **route groups, each with its own root layout** (that's how the `<html lang>` attribute differs per locale):

- `app/(en)/` · `/` home, `/privacy`, `/500`, `/lab` (unlisted R3F playground), `not-found.tsx` + a `[...notFound]` catch-all
- `app/(es)/es/` · Spanish home
- `app/(dev)/dev/` · terminal/IDE-styled "dev mode" (own dark theme + fonts, noindex)
- `app/api/` · route handlers: `chat` (Claude console SSE), `strava`, `geo`

Content lives in `src/content/home-{en,es}.ts`, typed by `src/content/home.ts` (`HomeStrings`). Fields suffixed `*Html` are trusted static markup rendered via `dangerouslySetInnerHTML` - never source them from user input.

### Components & client logic

Sections are **server components** in `src/components/home/*.tsx` (and `dev/`). Interactivity comes from **vanilla TS modules** in `src/scripts/`, loaded after hydration by the tiny client shims `HomeScripts.tsx` / `DevScripts.tsx` (`useEffect` + dynamic import). The scripts find elements by id/class, so markup fidelity matters more than React idioms. React Three Fiber lives in `src/components/three/` (client components).

Pre-paint logic (intro-curtain gate) lives in `public/head-init.js`, loaded as a blocking script at the top of `<body>` by `SiteChrome.tsx`; both root layouts set `suppressHydrationWarning` on `<html>` because that script stamps a class before React hydrates.

### CSS

Per-section files in `src/styles/home/`, aggregated by `index.css` (imported by `HomePage.tsx`); Vela tokens in `base.css`. **Global CSS in Next is bundle-wide**: `not-found.tsx` is compiled into every `(en)` route, so any stylesheet a shared-tree page imports leaks everywhere. Namespace page-specific stylesheets under a wrapper class (see `error-404.css` / `error-500.css`) - never write bare `body`/`h1`/`.wrap` rules outside `base.css`.

### Security headers

CSP and friends live in **`vercel.json`** (edge) and **`next.config.ts`** `headers()` - keep both in sync. `script-src` includes `'unsafe-inline'` because the App Router streams its RSC payload through inline scripts. When adding a third-party host, update **both** files.

### Hydration rules

- Time-dependent render output (the Bogotá clock) needs `suppressHydrationWarning` on its element.
- React cannot reconcile children of `<template>`: ship template content via `dangerouslySetInnerHTML` (see `Strava.tsx`).

### Path Aliases

`@/*` → `./src/*` (configured in `tsconfig.json`).

## Conventions & best practices

### File size

**Hard cap: 300 lines per file.** Split scripts into `src/scripts/<name>.ts`, markup into components, long styles into their own `.css`.

### Style

- Prettier: 2-space indent, single quotes (TS/TSX), no semicolons.
- Don't fight the formatter · run `npm run format` instead of hand-formatting.

### Animations & accessibility

Every animation must respect `prefers-reduced-motion` (gate rAF loops on the media query; wrap CSS animations in `@media (prefers-reduced-motion: no-preference)`). All `<img>` need `alt`. Text colors must hold WCAG AA (4.5:1) - `--muted` is calibrated for that; don't lighten it.

### SEO assets

- Metadata comes from `src/lib/seo.ts` (`buildMetadata`) + `JsonLd.tsx`; OG image `public/og-dev-preview.png` (1200×630).
- `app/sitemap.ts` lists indexable routes only. `public/robots.txt` and `public/.well-known/security.txt` are committed and should not be deleted.

### Tests

`tests/smoke.spec.ts` visits `/`, `/es/`, `/dev`, `/privacy`, a 404 route, and `/500` to catch console errors (including hydration errors) and broken renders. Add a smoke check whenever you ship a new page.

### Things to avoid

- Don't add a new font, analytics, or image host without updating CSP in **both** `vercel.json` and `next.config.ts`.
- Don't commit binary screenshots or build artifacts to the repo root · they belong in `/public` if they ship, otherwise `.gitignore` them.
- Don't introduce backwards-compatibility shims for visual changes · change the design directly.
- **Never add decorative vertical accent bars** (`border-left` rails next to stat numbers, cards, or quotes). Numbers and headings stand on their own; hairlines are horizontal, structural, and full-width or nothing.
- **Never use em-dashes** in user-facing copy · use a period, comma, or middot instead.
- Violet is for focus rings and selection only · never a violet heading, never a violet button.
