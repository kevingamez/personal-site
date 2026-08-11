// Enforces the repo's 300-line hard cap on source files (see CLAUDE.md).
// Covers TS/TSX/CSS under app/, src/, and tests/. Exits 1 listing offenders.

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const MAX_LINES = 300
const ROOTS = ['app', 'src', 'tests']
const EXTENSIONS = new Set(['.ts', '.tsx', '.css'])

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) yield* walk(path)
    else yield path
  }
}

const offenders = []
for (const root of ROOTS) {
  let entries
  try {
    entries = [...walk(root)]
  } catch {
    continue
  }
  for (const path of entries) {
    const ext = path.slice(path.lastIndexOf('.'))
    if (!EXTENSIONS.has(ext)) continue
    const lines = readFileSync(path, 'utf8').split('\n').length
    if (lines > MAX_LINES) offenders.push(`${String(lines).padStart(4)} ${path}`)
  }
}

if (offenders.length) {
  console.error(`Files over the ${MAX_LINES}-line cap:\n${offenders.sort().reverse().join('\n')}`)
  process.exit(1)
}
console.log(`check:size OK (cap ${MAX_LINES} lines)`)
