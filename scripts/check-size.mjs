// Enforces the repo's 300-line hard cap on source files (see CLAUDE.md).
// Covers tracked TS/TSX/JS/CSS files across the repo. Exits 1 listing offenders.

import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { extname } from 'node:path'

const MAX_LINES = 300
const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.css'])

const trackedFiles = execSync('git ls-files', { encoding: 'utf8' })
  .split('\n')
  .map((file) => file.trim())
  .filter(Boolean)

const offenders = []
for (const path of trackedFiles) {
  const extension = extname(path)
  if (!EXTENSIONS.has(extension)) continue
  const lines = readFileSync(path, 'utf8').split('\n').length
  if (lines > MAX_LINES) offenders.push(`${String(lines).padStart(4)} ${path}`)
}

if (offenders.length) {
  console.error(`Files over the ${MAX_LINES}-line cap:\n${offenders.sort().reverse().join('\n')}`)
  process.exit(1)
}
console.log(`check:size OK (cap ${MAX_LINES} lines)`)
