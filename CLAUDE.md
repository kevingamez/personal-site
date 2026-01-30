# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev      # Start dev server at localhost:4321
npm run build    # Build static site to ./dist/
npm run preview  # Preview production build locally
```

## Architecture Overview

This is a **personal portfolio site** built with Astro, featuring an interactive Conway's Game of Life background and bilingual support (English/Spanish).

### Tech Stack
- **Astro 5** - Static site generation with island architecture
- **Preact** - Lightweight React alternative for interactive components
- **Zustand** - State management (game state + i18n)
- **Tailwind CSS** - Utility-first styling with dark mode support
- **TypeScript** - Strict mode enabled

### Key Directories
- `src/pages/` - File-based routing (`index.astro` = EN, `es/index.astro` = ES)
- `src/components/` - Preact components (all interactive elements)
- `src/store/` - Zustand stores (`gameStore.ts`, `i18nStore.ts`)
- `src/i18n/locales/` - Translation JSON files (`en.json`, `es.json`)
- `src/lib/utils.ts` - Utility functions (`cn()` for class merging)

### Component Hydration
The main `PortfolioLayout.tsx` component uses `client:load` directive in Astro pages, making it interactive immediately. Child Preact components inherit this hydration.

### State Management Pattern
Zustand stores have custom Preact hooks (`useGameStore()`, `useI18n()`) that sync store changes to component state using `useState + useEffect`.

### Game of Life Implementation
`GameOfLifeIsland.tsx` is a Canvas-based Conway's Game of Life with:
- Pattern seeding (Glider Gun, LWSS, MWSS, etc.)
- Pointer interaction for painting cells
- Protected logo zone
- Theme-aware colors
- FPS ramping (1→10 FPS)

### i18n System
Translation keys use dot-notation (e.g., `t('nav.home')`). Language preference persists to localStorage. The `/es` route sets Spanish as default.

### Path Aliases
TypeScript configured with `@/*` alias pointing to `./src/*`.
