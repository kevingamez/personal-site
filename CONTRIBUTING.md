# Contributing

This is a personal portfolio. Feel free to fork it for your own use; if you spot a bug or have a small improvement, PRs are welcome.

## Getting started

This repo uses pnpm. Run `corepack enable pnpm` once to get the version pinned in `packageManager`.

```bash
pnpm install
pnpm dev    # localhost:3000
```

## Before pushing

```bash
pnpm format
pnpm lint
pnpm lint:css
pnpm check:size
pnpm check
pnpm format:check
pnpm test
```

CI also runs Lighthouse and Playwright on every PR.

## Code conventions

The full list is in `CLAUDE.md`. Highlights:

- **300-line hard cap** on every file. Split into components, modules, or stylesheets when you cross it.
- **No inline `<script>`** for anything beyond JSON-LD or small JSON data carriers. Put logic in `src/scripts/<area>/*.ts`.
- Every animation must respect `prefers-reduced-motion`.
- Security headers live in **both** `vercel.json` (served at the edge) and `next.config.ts` (`headers()`, used when Next serves directly). Update both when adding a new third-party host.
- Run `pnpm format` before opening a PR - Prettier config is enforced in CI.

## License

Personal project; all rights reserved - see [LICENSE](./LICENSE). The code is public for reference, not a permissive license - please don't ship a clone of the design.
