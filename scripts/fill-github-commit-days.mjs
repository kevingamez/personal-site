#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

const DEFAULT_YEAR = 2026
const DEFAULT_DATES = ['May 17', 'May 18', 'May 31']
const DEFAULT_TARGET = 46
const MARKER_FILE = '.github-commit-fill/log.txt'

const args = process.argv.slice(2)

function readOption(name) {
  const prefix = `${name}=`
  const inline = args.find((arg) => arg.startsWith(prefix))

  if (inline) {
    return inline.slice(prefix.length)
  }

  const index = args.indexOf(name)

  if (index !== -1) {
    return args[index + 1]
  }

  return null
}

function printHelp() {
  console.log(`Usage: node scripts/fill-github-commit-days.mjs [options]

Creates the missing commits needed to reach the target for selected dates.

Options:
  --apply              Create commits. Without this, the script only reports.
  --year <year>        Year to check. Defaults to ${DEFAULT_YEAR}.
  --dates <dates>      Comma-separated dates. Defaults to "${DEFAULT_DATES.join(', ')}".
  --target <count>     Minimum commits required per day. Defaults to ${DEFAULT_TARGET}.
  --help               Show this help message.

Examples:
  node scripts/fill-github-commit-days.mjs
  node scripts/fill-github-commit-days.mjs --apply
  node scripts/fill-github-commit-days.mjs --year 2026 --dates "May 17, May 18, May 31" --target 46 --apply`)
}

function parseTargetDate(dateText, year) {
  const parsed = new Date(`${dateText} ${year} 00:00:00`)

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date: "${dateText}"`)
  }

  return {
    label: parsed.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }),
    slug: formatDateSlug(parsed),
    since: formatGitDate(parsed, '00:00:00'),
    until: formatGitDate(parsed, '23:59:59'),
  }
}

function formatDateSlug(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatGitDate(date, time) {
  return `${formatDateSlug(date)} ${time}`
}

function runGit(args, options = {}) {
  return execFileSync('git', args, {
    encoding: 'utf8',
    ...options,
  })
}

function getCommitCountForDay(targetDate) {
  const output = runGit([
    'log',
    '--remotes',
    `--since-as-filter=${targetDate.since}`,
    `--until=${targetDate.until}`,
    '--format=%H',
  ]).trim()

  if (!output) {
    return 0
  }

  return output.split('\n').length
}

function assertNoStagedChanges() {
  const staged = runGit(['diff', '--cached', '--name-only']).trim()

  if (staged) {
    throw new Error(`There are already staged changes:\n${staged}`)
  }
}

function createCommit(targetDate, commitIndex, totalCommits) {
  const repoRoot = runGit(['rev-parse', '--show-toplevel']).trim()
  const markerPath = join(repoRoot, MARKER_FILE)
  const minute = String(commitIndex % 60).padStart(2, '0')
  const hour = String(9 + Math.floor(commitIndex / 60)).padStart(2, '0')
  const timestamp = `${targetDate.slug}T${hour}:${minute}:00`
  const message = `chore: record activity for ${targetDate.label} ${commitIndex} of ${totalCommits}`
  const previousContent = existsSync(markerPath) ? readFileSync(markerPath, 'utf8') : ''

  mkdirSync(dirname(markerPath), { recursive: true })
  writeFileSync(markerPath, `${previousContent}${timestamp}\n`)

  runGit(['add', MARKER_FILE], { stdio: 'inherit' })
  execFileSync('git', ['commit', '--no-gpg-sign', '-m', message], {
    env: {
      ...process.env,
      GIT_AUTHOR_DATE: timestamp,
      GIT_COMMITTER_DATE: timestamp,
    },
    stdio: 'inherit',
  })
}

if (args.includes('--help')) {
  printHelp()
  process.exit(0)
}

const shouldApply = args.includes('--apply')
const year = Number(readOption('--year') ?? DEFAULT_YEAR)
const target = Number(readOption('--target') ?? DEFAULT_TARGET)

if (!Number.isInteger(year) || year < 1970) {
  throw new Error('The --year value must be a valid year.')
}

if (!Number.isInteger(target) || target < 1) {
  throw new Error('The --target value must be a positive whole number.')
}

const dates = (readOption('--dates') ?? DEFAULT_DATES.join(','))
  .split(',')
  .map((date) => date.trim())
  .filter(Boolean)

if (dates.length === 0) {
  throw new Error('At least one date is required.')
}

if (shouldApply) {
  assertNoStagedChanges()
}

console.log('GitHub commit target report')
console.log('')
console.log(`Target: at least ${target} commits per day`)
console.log(`Mode: ${shouldApply ? 'apply' : 'dry run'}`)
console.log('')

for (const targetDate of dates.map((dateText) => parseTargetDate(dateText, year))) {
  const commitCount = getCommitCountForDay(targetDate)
  const missing = Math.max(target - commitCount, 0)

  if (missing === 0) {
    console.log(`- ${targetDate.label}: target met with ${commitCount} commits.`)
    continue
  }

  console.log(`- ${targetDate.label}: ${commitCount} commits found, creating ${missing}.`)

  if (!shouldApply) {
    continue
  }

  for (let index = 1; index <= missing; index += 1) {
    createCommit(targetDate, index, missing)
  }
}
