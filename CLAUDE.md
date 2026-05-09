# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev           # Start dev server at localhost:4321
npm run build         # Build static site to ./dist/
npm run preview       # Preview production build locally
npm run check         # Type-check .astro and .ts (astro check)
npm run format        # Apply Prettier to all files
npm run format:check  # Verify formatting in CI / pre-deploy
```

## Architecture Overview

Personal portfolio site built with **Astro 5**, deployed as a static build on **Vercel**. Bilingual (EN/ES). Editorial visual design (cream + coral, Instrument Serif + Inter Tight + JetBrains Mono).

### Tech Stack

- **Astro 5** — static site generation, no SSR adapter
- **Preact** — installed but currently no islands; pages are pure `.astro`
- **TypeScript** — strict mode (`astro/tsconfigs/strict`)
- **Prettier** + `prettier-plugin-astro` — formatting

No CSS framework: each page is self-contained with inline `<style>` blocks scoped to the page (Astro auto-scopes them with `data-astro-cid-*`).

### Pages

- `src/pages/index.astro` — English home (full design, Conway hero)
- `src/pages/es/index.astro` — Spanish mirror
- `src/pages/dev.astro` — terminal/IDE-styled "dev mode" view
- `src/pages/404.astro` — themed not-found

### Interactivity

All client logic is **inline `<script is:inline>`** in each page (no Preact islands right now). The Conway Game of Life canvas, GitHub contribution graph, dev-mode sparkline / heatmap / request-log / terminal REPL are all vanilla JS in the page itself. If new features need shared state, prefer adding a Preact island under `src/components/` and importing it with a `client:` directive over reintroducing a global store.

### Middleware

`src/middleware.ts` sets security headers (CSP, X-Frame-Options, etc). It runs only when the project is built with an SSR adapter; for the current static deploy on Vercel, it is dormant — set headers via `vercel.json` if you need them at the edge.

### Path Aliases

`@/*` → `./src/*` (configured in `tsconfig.json`).

### Conventions

- Prettier config: 2-space indent, single quotes (TS/JS), double quotes (.astro/HTML), semicolons off in TS.
- Run `npm run check` and `npm run format:check` before pushing.
- Inline scripts use `is:inline` so Astro doesn't bundle them — keep the GoL, contrib graph, and terminal logic self-contained.
- When editing the design verbatim from the prototype, keep markup whitespace as Prettier produces it; don't fight the formatter.
