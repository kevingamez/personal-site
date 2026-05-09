# kevingamez.com

Personal portfolio for Kevin Gámez. Editorial visual design (cream + coral, Instrument Serif + Inter Tight + JetBrains Mono), bilingual (EN/ES), with a `/dev` route that mirrors the site's data inside a VS Code-styled IDE.

Built with [Astro 5](https://astro.build) as a fully static site, deployed on [Vercel](https://vercel.com).

## Pages

| Route  | Source                     | Description                                     |
| ------ | -------------------------- | ----------------------------------------------- |
| `/`    | `src/pages/index.astro`    | English home, Conway Game of Life hero          |
| `/es/` | `src/pages/es/index.astro` | Spanish mirror                                  |
| `/dev` | `src/pages/dev.astro`      | Terminal/IDE view: CodeMirror, ⌘P, ⌘S, terminal |
| `/404` | `src/pages/404.astro`      | Themed not-found                                |

## Project layout

```
src/
├── pages/          # one .astro per route (≤300 lines, thin compositions)
├── components/     # Layout + per-page section components
│   ├── home/       # Nav, Hero, About, Skills, …
│   └── dev/        # ActivityBar, Explorer, EditorPanel, Terminal, …
├── content/        # i18n strings (home-en.ts, home-es.ts, schema in home.ts)
├── data/           # build-time data for /dev (filesystem snapshot, GitHub repos)
├── styles/         # CSS extracted from pages, split per concern
│   ├── home/       # base, nav, hero, sections, …
│   └── dev/        # chrome, editor, terminal, palette, …
├── scripts/        # client-side TS, bundled by Astro
│   ├── home/       # Conway, contribution graph, GH stats
│   ├── dev/        # explorer, editor, terminal, palette, workspaces, …
│   └── lib/        # shared utilities (analytics, logger)
├── lib/            # shared (build-time + client) typed config
└── middleware.ts   # security headers (mirror of vercel.json, dormant on static deploy)
```

## Commands

```bash
npm install            # install deps
npm run dev            # dev server at localhost:4321
npm run build          # static build to ./dist/
npm run preview        # preview the build locally
npm run check          # typecheck (astro check)
npm run format         # apply Prettier
npm run format:check   # verify formatting
npm test               # Playwright smoke tests against the build
npm run test:install   # one-time playwright browser install
```

## Conventions

- **300-line hard cap per file.** Pages compose components; long scripts split into modules under `src/scripts/`; long stylesheets split into `src/styles/<area>/*.css`.
- **No inline JS** beyond JSON-LD, GA, and `<script id="dev-data">` carriers. All client logic is bundled via `<script>import '@/scripts/...';</script>`.
- **`prefers-reduced-motion`** is respected by every animated element (Conway, sparkline, request log, build streams).
- **Security headers** live in `vercel.json`; `src/middleware.ts` mirrors them as a fallback.
- See `CLAUDE.md` for the full convention list.

## CI

`.github/workflows/ci.yml` runs three jobs on push/PR to `main`:

- **check** — `format:check` + `astro check` + `build`
- **smoke** — Playwright smoke tests against the built preview
- **lighthouse** — performance/a11y/SEO/best-practices budgets (`.lighthouserc.json`)

## Deploy

Vercel deploys `main` automatically. `vercel.json` configures security headers and the immutable cache for `/_astro/*`. No SSR adapter — the entire site is pre-rendered.

## License

Personal project; all rights reserved. Source is public for reference; ask before reusing the design.
