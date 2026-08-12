// The file tree dev mode's explorer renders.
//
// This used to inline the contents of seventeen hand-listed paths, which meant
// the explorer showed a curated snapshot and silently missed every file added
// afterwards. It now emits the whole tracked tree, but as PATHS with empty
// bodies: 241 files are 754 KB of source, and inlining that put /dev near a
// megabyte of HTML. Bodies arrive from /api/repo when a file is opened.
//
// README.md keeps its body inline because index.ts opens it on load, so the
// first thing a visitor sees paints without a round trip.

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { langOf, listSourcePaths, projectRoot } from './repo-source'

export { projectRoot }

export type LocalFiles = Record<string, { lang: string; body: string }>

const EAGER = ['README.md']

export function loadLocalFiles(): LocalFiles {
  const out: LocalFiles = {}
  for (const p of listSourcePaths()) {
    let body = ''
    if (EAGER.includes(p)) {
      try {
        body = readFileSync(join(projectRoot, p), 'utf-8')
      } catch {
        body = ''
      }
    }
    out[p] = { lang: langOf(p), body }
  }
  return out
}
