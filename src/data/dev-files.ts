// Read real project files at build time so the dev-mode "explorer" reflects
// the codebase. Order of LOCAL_FILE_PATHS matters — preserved in tree rendering.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export const projectRoot = process.cwd()

export const readSafe = (rel: string): string => {
  try {
    return readFileSync(join(projectRoot, rel), 'utf-8')
  } catch {
    return ''
  }
}

export const langOf = (name: string): string => {
  const lower = name.toLowerCase()
  if (lower.endsWith('.astro')) return 'astro'
  if (
    lower.endsWith('.ts') ||
    lower.endsWith('.tsx') ||
    lower.endsWith('.js') ||
    lower.endsWith('.mjs') ||
    lower.endsWith('.cjs')
  )
    return 'ts'
  if (lower.endsWith('.rs')) return 'rs'
  if (lower.endsWith('.md')) return 'md'
  if (lower.endsWith('.json')) return 'json'
  if (lower.endsWith('.toml')) return 'toml'
  if (lower.endsWith('.css')) return 'css'
  if (lower.endsWith('.html')) return 'html'
  return 'plain'
}

export const LOCAL_FILE_PATHS = [
  'src/pages/es/index.astro',
  'src/pages/404.astro',
  'src/pages/dev.astro',
  'src/pages/index.astro',
  'src/middleware.ts',
  '.editorconfig',
  '.gitignore',
  '.prettierignore',
  '.prettierrc.json',
  'astro.config.mjs',
  'CHANGELOG.md',
  'CLAUDE.md',
  'CONTRIBUTING.md',
  'package.json',
  'README.md',
  'tsconfig.json',
]

export type LocalFiles = Record<string, { lang: string; body: string }>

export function loadLocalFiles(): LocalFiles {
  const out: LocalFiles = {}
  for (const p of LOCAL_FILE_PATHS) {
    const body = readSafe(p)
    if (body) out[p] = { lang: langOf(p), body }
  }
  return out
}
