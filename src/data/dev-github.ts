// Fetch the user's public GitHub repos + READMEs at build time, with a 1-day
// disk cache so builds without network/rate-limit still succeed.
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { projectRoot } from './dev-files'

export const GH_USER = 'kevingamez'

type RawRepo = {
  name: string
  full_name: string
  description: string | null
  html_url: string
  stargazers_count: number
  language: string | null
  topics?: string[]
  updated_at: string
  fork: boolean
  archived: boolean
}

export type Repo = {
  name: string
  description: string | null
  url: string
  stars: number
  language: string | null
  topics: string[]
  updated: string
  archived: boolean
  readme: string
}

const cacheFile = join(projectRoot, '.cache', 'github-repos.json')
const ONE_DAY = 24 * 60 * 60 * 1000

function readCache(): Repo[] {
  try {
    if (!existsSync(cacheFile)) return []
    const data = JSON.parse(readFileSync(cacheFile, 'utf-8')) as Repo[]
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}
function writeCache(repos: Repo[]) {
  try {
    mkdirSync(dirname(cacheFile), { recursive: true })
    writeFileSync(cacheFile, JSON.stringify(repos, null, 2))
  } catch {
    // ignore cache write failures
  }
}
function cacheAgeMs(): number {
  try {
    return Date.now() - statSync(cacheFile).mtimeMs
  } catch {
    return Infinity
  }
}

async function fetchGithubRepos(): Promise<Repo[]> {
  try {
    const headers: Record<string, string> = {
      'User-Agent': 'personal-site-build',
      Accept: 'application/vnd.github+json',
    }
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`

    const res = await fetch(
      `https://api.github.com/users/${GH_USER}/repos?per_page=30&sort=updated&type=owner`,
      {
        headers,
      }
    )
    if (!res.ok) return []
    const repos = (await res.json()) as RawRepo[]
    if (!Array.isArray(repos)) return []
    const filtered = repos.filter((r) => !r.fork).slice(0, 12)
    const enriched: Repo[] = []
    for (const r of filtered) {
      let readme = ''
      try {
        const rr = await fetch(`https://api.github.com/repos/${r.full_name}/readme`, {
          headers: { ...headers, Accept: 'application/vnd.github.raw' },
        })
        if (rr.ok) readme = await rr.text()
      } catch {
        // ignore individual readme failures
      }
      enriched.push({
        name: r.name,
        description: r.description,
        url: r.html_url,
        stars: r.stargazers_count,
        language: r.language,
        topics: r.topics || [],
        updated: r.updated_at,
        archived: r.archived,
        readme:
          readme ||
          `# ${r.name}\n\n${r.description || '_(no description)_'}\n\n[${r.html_url}](${r.html_url})\n`,
      })
    }
    return enriched
  } catch {
    return []
  }
}

export async function loadGithubRepos(): Promise<Repo[]> {
  const cached = readCache()
  let repos: Repo[] = cached
  if (!cached.length || cacheAgeMs() > ONE_DAY) {
    const fresh = await fetchGithubRepos()
    if (fresh.length) {
      repos = fresh
      writeCache(fresh)
    }
  }
  return repos
}

const fmtDate = (iso: string) => new Date(iso).toISOString().slice(0, 10)

// ─── Recent commits (GitHub Events API) ──────────────────────────────────
// Used by the Source Control panel in /dev. One call returns push events
// across ALL the user's public repos, each with a commits[] payload.
export type RecentCommit = {
  sha: string
  shaShort: string
  message: string
  repo: string // "kevingamez/personal-site"
  repoShort: string // "personal-site"
  branch: string // "main"
  url: string
  ts: string // ISO date
}

const commitsCacheFile = join(projectRoot, '.cache', 'github-commits.json')
const COMMIT_CACHE_TTL = 6 * 60 * 60 * 1000 // 6h

function readCommitCache(): RecentCommit[] {
  try {
    if (!existsSync(commitsCacheFile)) return []
    const data = JSON.parse(readFileSync(commitsCacheFile, 'utf-8')) as RecentCommit[]
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}
function writeCommitCache(rows: RecentCommit[]) {
  try {
    mkdirSync(dirname(commitsCacheFile), { recursive: true })
    writeFileSync(commitsCacheFile, JSON.stringify(rows, null, 2))
  } catch {
    // ignore cache write failures
  }
}
function commitCacheAgeMs(): number {
  try {
    return Date.now() - statSync(commitsCacheFile).mtimeMs
  } catch {
    return Infinity
  }
}

type RawEvent = {
  type: string
  repo: { name: string }
  created_at: string
  payload?: {
    ref?: string
    commits?: Array<{ sha: string; message: string; url: string }>
  }
}

async function fetchRecentCommits(): Promise<RecentCommit[]> {
  try {
    const headers: Record<string, string> = {
      'User-Agent': 'personal-site-build',
      Accept: 'application/vnd.github+json',
    }
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`

    const res = await fetch(
      `https://api.github.com/users/${GH_USER}/events/public?per_page=100`,
      { headers }
    )
    if (!res.ok) return []
    const events = (await res.json()) as RawEvent[]
    if (!Array.isArray(events)) return []

    const rows: RecentCommit[] = []
    for (const e of events) {
      if (e.type !== 'PushEvent' || !e.payload?.commits) continue
      const branch = (e.payload.ref || 'refs/heads/main').replace('refs/heads/', '')
      for (const c of e.payload.commits) {
        const repoShort = e.repo.name.split('/')[1] || e.repo.name
        rows.push({
          sha: c.sha,
          shaShort: c.sha.slice(0, 7),
          message: (c.message || '').split('\n')[0].slice(0, 100),
          repo: e.repo.name,
          repoShort,
          branch,
          url: `https://github.com/${e.repo.name}/commit/${c.sha}`,
          ts: e.created_at,
        })
        if (rows.length >= 30) break
      }
      if (rows.length >= 30) break
    }
    return rows
  } catch {
    return []
  }
}

export async function loadRecentCommits(): Promise<RecentCommit[]> {
  const cached = readCommitCache()
  if (cached.length && commitCacheAgeMs() < COMMIT_CACHE_TTL) return cached
  const fresh = await fetchRecentCommits()
  if (fresh.length) {
    writeCommitCache(fresh)
    return fresh
  }
  return cached
}

export function generateOverview(repos: Repo[]): string {
  const ls: string[] = []
  ls.push(`# ${GH_USER} · public repos`)
  ls.push('')
  if (!repos.length) {
    ls.push('_GitHub API was unreachable at build time. Check back later._')
    return ls.join('\n')
  }
  ls.push(`> Auto-generated at build · ${repos.length} public repos · sorted by last updated.`)
  ls.push('')
  for (const r of repos) {
    ls.push(`## ${r.name}${r.archived ? ' *(archived)*' : ''}`)
    if (r.description) ls.push(`> ${r.description}`)
    const meta: string[] = []
    if (r.language) meta.push(r.language)
    if (r.stars > 0) meta.push(`★ ${r.stars}`)
    meta.push(`updated ${fmtDate(r.updated)}`)
    ls.push('')
    ls.push('`' + meta.join(' · ') + '`')
    if (r.topics.length) {
      ls.push('')
      ls.push('tags: ' + r.topics.map((t) => '`' + t + '`').join(' '))
    }
    ls.push('')
    ls.push(`[${r.url}](${r.url})`)
    ls.push('')
  }
  return ls.join('\n')
}
