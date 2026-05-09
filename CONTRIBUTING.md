# Contributing

This is a personal portfolio. Feel free to fork it for your own use; if you spot a bug or have a small improvement, PRs are welcome.

## Getting started

```bash
npm install
npm run dev    # localhost:4321
```

## Before pushing

```bash
npm run format
npm run check
npm run format:check
npm test
```

CI also runs Lighthouse and Playwright on every PR.

## Code conventions

The full list is in `CLAUDE.md`. Highlights:

- **300-line hard cap** on every file. Split into components, modules, or stylesheets when you cross it.
- **No `<script is:inline>`** for anything beyond JSON-LD, GA, or small JSON data carriers. Put logic in `src/scripts/<area>/*.ts`.
- Every animation must respect `prefers-reduced-motion`.
- Security headers live in **both** `vercel.json` (canonical, served at the edge) and `src/middleware.ts` (fallback). Update both when adding a new third-party host.
- Run `npm run format` before opening a PR — Prettier config is enforced in CI.

## License

Personal project; all rights reserved. The code is public for reference, not a permissive license — please don't ship a clone of the design.
