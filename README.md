# personal-site

This is the repo behind **kevingamez.co**. A Next.js site with two faces: a calm editorial home (Vela system: paper `#F4F4F2`, ink `#0B0B0C`, violet as the only interactive accent, Inter + JetBrains Mono), and a `/dev` page that's basically VS Code in your browser, file tree, terminal, real CodeMirror editor, command palette.

The home is what HR and clients see. `/dev` is what other engineers see. Same person, two registers.

`/dev` loads this exact repo at build time via `fs.readFileSync`, plus my public GitHub repos via the REST API (cached locally so the build still works when the API rate-limits us). Click a file in the tree and you get a real editor with syntax colors, search (⌘F), undo/redo, multi-cursor, save (⌘S → localStorage). The terminal at the bottom is a tiny shell with `ls`/`cd`/`cat`/`tree`/`mkdir`/etc operating on the in-memory FS.

Statically rendered where it can be, plus three route handlers under `app/api/`. Deploys on Vercel.

## Table of Contents

- [Pages](#pages)
- [Architecture](#architecture)
  - [What this is NOT](#what-this-is-not)
  - [Routing](#routing)
  - [Home page](#home-page)
  - [/dev page](#dev-page)
  - [API routes](#api-routes)
- [Source Code Map](#source-code-map)
  - [Where to make changes](#where-to-make-changes)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Conventions](#conventions)
- [CI](#ci)
- [Deployment](#deployment)
- [Known gotchas](#known-gotchas)

## Pages

| Route       | Source                                            | What it is                                                                                            |
| ----------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `/`         | `app/(en)/page.tsx`                               | English home. Conway hero, About, Stack, Experience, Work, GitHub, Strava, Writing, Console, Contact. |
| `/es/`      | `app/(es)/es/page.tsx`                            | Same sections, Spanish copy from `src/content/home-es.ts`.                                            |
| `/resume/`  | `app/(en)/resume/page.tsx`                        | Standalone résumé, print-friendly, with a PDF download.                                               |
| `/privacy/` | `app/(en)/privacy/page.tsx`                       | What the site collects and how to opt out.                                                            |
| `/dev/`     | `app/(dev)/dev/page.tsx`                          | VS Code in the browser. CodeMirror editor, file tree, terminal, command palette.                      |
| `/lab/`     | `app/(en)/lab/page.tsx`                           | Unlisted React Three Fiber playground.                                                                |
| 404 / 500   | `app/(en)/not-found.tsx`, `app/(en)/500/page.tsx` | Themed error pages.                                                                                   |

## Architecture

### What this is NOT

- Not a CMS. All copy lives in `src/content/*.ts` as typed objects. Translating is editing two files.
- Not bilingual via i18next or middleware. EN and ES are two route groups that import the same components and pass different `t` props.
- Not a real IDE. `/dev` is a static showcase, code edits land in `localStorage`, never in the actual repo. The terminal is a fake shell with a virtual filesystem.

### Routing

Three **route groups, each with its own root layout**, which is how `<html lang>` differs per locale:

- `app/(en)/`, home, `/resume`, `/privacy`, `/500`, `/lab`, `not-found.tsx` and a `[...notFound]` catch-all
- `app/(es)/es/`, Spanish home
- `app/(dev)/dev/`, dev mode, its own dark theme and fonts, noindex
- `app/api/`, route handlers: `chat`, `strava`, `geo`

`trailingSlash: true` in `next.config.ts` preserves the URLs the site has always had.

### Home page

Sections are **server components** under `src/components/home/`. Interactivity comes from vanilla TS modules in `src/scripts/`, loaded after hydration by `HomeScripts.tsx` (`useEffect` + dynamic import). Those scripts find elements by id and class, so markup fidelity matters more than React idioms.

The Conway hero is a `<canvas>` driven by `src/scripts/home/conway.ts`, toroidal grid, click to seed, B3/S23 rules, FPS-throttled, respects `prefers-reduced-motion`. React Three Fiber pieces live in `src/components/three/`.

Pre-paint logic (the intro-curtain gate) lives in `public/head-init.js`, loaded as a blocking script at the top of `<body>` by `SiteChrome.tsx`. Both root layouts set `suppressHydrationWarning` on `<html>` because that script stamps a class before React hydrates.

### /dev page

`src/data/dev.ts` gathers the build-time payload: `dev-files.ts` reads a curated set of real project files off disk, and `dev-github.ts` hits `api.github.com/users/kevingamez/repos` with a local cache fallback. The payload is serialized into the page as JSON; client modules in `src/scripts/dev/` read it and build the in-memory FS behind the explorer, shell and editor.

### API routes

- `app/api/chat`, streams Claude responses for the console. Per-IP daily rate limit backed by Upstash/Vercel KV; **fails closed with 503 if KV is not configured**.
- `app/api/strava`, live totals for the movement section.
- `app/api/geo`, coarse visitor locale hints.

## Source Code Map

```
app/
  (en)/          English routes + error pages
  (es)/es/       Spanish home
  (dev)/dev/     dev mode
  api/           chat, strava, geo
  sitemap.ts     indexable routes
src/
  components/    home/, dev/, site/, three/
  content/       home-en.ts, home-es.ts, home.ts (types)
  data/          build-time payloads (dev files, GitHub, posts)
  lib/           seo.ts (metadata builder), analytics, logger
  scripts/       vanilla TS behaviour, loaded after hydration
  styles/        home/, dev/, per-page stylesheets
public/          images, head-init.js, robots.txt, llms.txt, docs/
```

### Where to make changes

| I want to…                    | Edit                                                         |
| ----------------------------- | ------------------------------------------------------------ |
| Change home copy              | `src/content/home-en.ts` **and** `home-es.ts`                |
| Add a section                 | component in `src/components/home/` + wire in `HomePage.tsx` |
| Change section behaviour      | `src/scripts/home/*.ts`                                      |
| Change styles                 | `src/styles/home/*.css` (aggregated by `index.css`)          |
| Add a security header or host | **Both** `vercel.json` and `next.config.ts`                  |
| Change metadata / OG          | `src/lib/seo.ts` and `src/components/site/JsonLd.tsx`        |
| Change which files /dev shows | `src/data/dev-files.ts`                                      |

## Tech Stack

- **Next.js 16** (App Router), **React 19**, **TypeScript** strict
- **React Three Fiber** / three.js for the 3D pieces
- **CodeMirror 6** for the /dev editor
- **Anthropic SDK** for the console, streamed from a route handler
- **Playwright** smoke tests, **ESLint** (typescript-eslint + jsx-a11y), **Stylelint**, **Prettier**
- **Vercel** hosting, analytics and speed insights

## Getting Started

Requires **Node >= 22.12.0** and **pnpm** (`corepack enable pnpm` picks up the version pinned in `packageManager`).

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

Copy `.env.example` to `.env.local` for the API routes. The chat console needs `ANTHROPIC_API_KEY` **and** KV credentials, otherwise it answers 503 by design.

### Commands

```bash
pnpm dev           # dev server at :3000
pnpm build         # production build
pnpm preview       # serve the build at 127.0.0.1:4321
pnpm check         # tsc --noEmit
pnpm lint          # eslint
pnpm lint:css      # stylelint
pnpm check:size    # 300-line file cap
pnpm format        # prettier --write
pnpm format:check  # prettier --check (CI)
pnpm test              # playwright smoke tests
pnpm images:webp   # regenerate webp variants of public images
```

## Conventions

Full list in `CLAUDE.md`. Highlights:

- **300-line hard cap** per file, enforced by `pnpm check:size`.
- Global CSS in Next is bundle-wide: namespace page stylesheets under a wrapper class, never write bare `body`/`h1` rules outside `base.css`.
- Every animation respects `prefers-reduced-motion`; every `<img>` has `alt`.
- `*Html` content fields are trusted static markup rendered with `dangerouslySetInnerHTML`, never source them from user input.
- Prettier: 2-space indent, single quotes, no semicolons.

## CI

`.github/workflows/ci.yml` runs on every PR: `format:check`, `lint`, `lint:css`, `check:size`, `check`, `build`, then Playwright smoke tests and Lighthouse.

## Deployment

Vercel, from the default branch. Security headers are served twice on purpose: `vercel.json` applies them at the edge, `next.config.ts` `headers()` applies them whenever Next serves directly. Keep the two in sync.

## Known gotchas

- **Two CSP sources.** Adding a font, analytics or image host means editing `vercel.json` **and** `next.config.ts`. Miss one and it breaks only in one serving path.
- **`script-src` needs `'unsafe-inline'`.** The App Router streams its RSC payload through inline scripts. Nonces would force per-request dynamic rendering.
- **The chat fails closed.** No KV credentials means every console request returns 503, which is intended, not a bug.
- **/dev reads real paths.** If you move or rename a file listed in `src/data/dev-files.ts`, the explorer silently drops it (missing reads are swallowed). Update that list when restructuring.
- **Bilingual drift.** `home-en.ts` and `home-es.ts` are maintained by hand; changing copy in one means changing the other.

## License

Personal project; all rights reserved, see [LICENSE](./LICENSE). The code is public for reference, not a permissive license, please don't ship a clone of the design.
