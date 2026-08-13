// Where dev mode's source viewer gets its code.
//
// The explorer used to inline seventeen hand-listed files at build time, so
// anything added to the project stayed invisible until someone remembered to
// extend the array. Now the build emits the whole tracked tree as PATHS only
// and the bodies are fetched one at a time from GitHub, which keeps the page
// payload flat (241 files are 754 KB of source; inlining them put /dev near a
// megabyte of HTML) and means the viewer follows the repository instead of a
// snapshot of it.
//
// The ref is the DEPLOYED COMMIT, not the branch head. Vercel exposes it as
// VERCEL_GIT_COMMIT_SHA, and using it means /dev shows the code that is
// actually running the page you are looking at. Falling back to the default
// branch keeps local development working, where that variable is absent.

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

export const REPO_OWNER = 'kevingamez'
export const REPO_NAME = 'personal-site'
export const projectRoot = process.cwd()

export function repoRef(): string {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA
  return sha && /^[0-9a-f]{7,40}$/i.test(sha) ? sha : 'main'
}

// Directories that are either build output, dependencies, or private scratch.
const SKIP_DIRS = new Set([
  '.git',
  '.next',
  '.vercel',
  'node_modules',
  'out',
  'dist',
  'playwright-report',
  'test-results',
  'brain-archive',
  '.cache',
])

// Only text a reader would want to open. Binaries and the lockfile are noise.
const TEXT_EXT =
  /\.(ts|tsx|js|jsx|mjs|cjs|css|json|md|txt|yml|yaml|toml|html|glsl|rs|sh|editorconfig|gitignore|prettierignore)$/i

const isTextPath = (rel: string): boolean => {
  if (rel === 'pnpm-lock.yaml') return false
  // Dotfiles fall out of this correctly: the pattern anchors on a literal dot,
  // so `.gitignore` and `.editorconfig` match on their own names.
  return TEXT_EXT.test(rel.split('/').pop() || '')
}

export function langOf(name: string): string {
  const l = name.toLowerCase()
  if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(l)) return 'ts'
  if (l.endsWith('.rs')) return 'rs'
  if (l.endsWith('.md')) return 'md'
  if (l.endsWith('.json')) return 'json'
  if (l.endsWith('.toml')) return 'toml'
  if (l.endsWith('.css')) return 'css'
  if (/\.(yml|yaml)$/.test(l)) return 'yaml'
  if (l.endsWith('.html')) return 'html'
  return 'txt'
}

// Walks the project once at build time. Returns POSIX-style relative paths so
// the client can use them as tree keys and as the `path` query for the API.
export function listSourcePaths(max = 400): string[] {
  const out: string[] = []
  const walk = (dir: string): void => {
    if (out.length >= max) return
    let entries: string[]
    try {
      entries = readdirSync(dir)
    } catch {
      return
    }
    for (const name of entries) {
      if (out.length >= max) return
      if (SKIP_DIRS.has(name)) continue
      const abs = join(dir, name)
      let st
      try {
        st = statSync(abs)
      } catch {
        continue
      }
      if (st.isDirectory()) {
        walk(abs)
        continue
      }
      const rel = relative(projectRoot, abs).split(sep).join('/')
      if (isTextPath(rel)) out.push(rel)
    }
  }
  walk(projectRoot)
  return out.sort()
}

// Request-time read of one file, GitHub first so a push shows up without a
// redeploy, disk second so the viewer still works when GitHub is unreachable,
// rate-limited, or simply does not have this commit yet (local development,
// or a branch that was never pushed).
export async function readSourceFile(rel: string): Promise<{ body: string; from: string } | null> {
  const raw = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${repoRef()}/${rel}`
  try {
    const token = process.env.GITHUB_TOKEN
    const res = await fetch(raw, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      // One hour at the CDN, keyed by the immutable commit ref in the URL.
      next: { revalidate: 3600 },
    })
    if (res.ok) return { body: await res.text(), from: 'github' }
  } catch {
    // fall through to disk
  }
  try {
    return { body: readFileSync(join(projectRoot, rel), 'utf-8'), from: 'disk' }
  } catch {
    return null
  }
}
