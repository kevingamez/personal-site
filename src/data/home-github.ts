// Live GitHub stats for the home page banner. Fetched at build time, cached
// to disk so subsequent builds work without network. Powers:
//   - public repos count
//   - distinct languages shipped
//   - years on GitHub (since account creation)
//   - language mix bar (top N by bytes across all public repos)
//   - top repos list (by stars, ties broken by updated_at)
//
// Token: optional. Anonymous fetch caps at 60 req/hr; with $GITHUB_TOKEN it's
// 5000/hr. The build still works without one (falls back to cache).
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { GH_USER } from './dev-github'
import { projectRoot } from './dev-files'

export type LangSlice = { name: string; pct: number; color: string }
export type RepoCard = {
  name: string
  description: string
  language: string
  color: string
  stars: number
  url: string
}
export type ContribDay = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }
export type ContribCalendar = {
  totalContributions: number
  days: ContribDay[] // ~365 entries, oldest first
  longestStreak: number
  currentStreak: number
}
export type HomeStats = {
  publicRepos: number
  languagesShipped: number
  yearsOnGithub: number
  languageMix: LangSlice[]
  topRepos: RepoCard[]
  contribCalendar: ContribCalendar
}

// GitHub-canonical language colors (subset most likely in this repo set).
// Source: github/linguist's `languages.yml`.
const LANG_COLOR: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Swift: '#F05138',
  Dart: '#00B4AB',
  Dockerfile: '#384d54',
  CSS: '#563d7c',
  HTML: '#e34c26',
  Astro: '#ff5d01',
  Rust: '#dea584',
  Go: '#00ADD8',
  Ruby: '#701516',
  Java: '#b07219',
  Kotlin: '#A97BFF',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  Shell: '#89e051',
  PHP: '#4F5D95',
  Lua: '#000080',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  Solidity: '#AA6746',
  TeX: '#3D6117',
  PowerShell: '#012456',
  R: '#198CE7',
  Scala: '#c22d40',
  'Jupyter Notebook': '#DA5B0B',
  SCSS: '#c6538c',
  Sass: '#a53b70',
  Vim: '#199f4b',
  Makefile: '#427819',
  YAML: '#cb171e',
}
const colorFor = (name: string): string => LANG_COLOR[name] || '#888888'

const cacheFile = join(projectRoot, '.cache', 'github-home.json')
const ONE_DAY = 24 * 60 * 60 * 1000

function readCache(): HomeStats | null {
  try {
    if (!existsSync(cacheFile)) return null
    return JSON.parse(readFileSync(cacheFile, 'utf-8')) as HomeStats
  } catch {
    return null
  }
}
function writeCache(stats: HomeStats): void {
  try {
    mkdirSync(dirname(cacheFile), { recursive: true })
    writeFileSync(cacheFile, JSON.stringify(stats, null, 2))
  } catch {
    /* ignore */
  }
}
function cacheAgeMs(): number {
  try {
    return Date.now() - statSync(cacheFile).mtimeMs
  } catch {
    return Infinity
  }
}

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const h: Record<string, string> = {
    'User-Agent': 'personal-site-build',
    Accept: 'application/vnd.github+json',
    ...extra,
  }
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  return h
}

type RawRepo = {
  name: string
  full_name: string
  description: string | null
  html_url: string
  stargazers_count: number
  language: string | null
  updated_at: string
  fork: boolean
  archived: boolean
}
type RawProfile = { created_at: string }

async function fetchAllRepos(): Promise<RawRepo[]> {
  // Owner type, public only, paginated. Personal-account ceiling is rarely past
  // 100 so we hit a single page; if needed, walk Link headers in the future.
  const url = `https://api.github.com/users/${GH_USER}/repos?per_page=100&sort=updated&type=owner`
  const res = await fetch(url, { headers: authHeaders() })
  if (!res.ok) throw new Error(`repos: ${res.status}`)
  const json = (await res.json()) as RawRepo[]
  if (!Array.isArray(json)) return []
  return json.filter((r) => !r.fork)
}
async function fetchProfile(): Promise<RawProfile> {
  const res = await fetch(`https://api.github.com/users/${GH_USER}`, { headers: authHeaders() })
  if (!res.ok) throw new Error(`profile: ${res.status}`)
  return (await res.json()) as RawProfile
}
async function fetchRepoLanguages(fullName: string): Promise<Record<string, number>> {
  const res = await fetch(`https://api.github.com/repos/${fullName}/languages`, {
    headers: authHeaders(),
  })
  if (!res.ok) return {}
  return (await res.json()) as Record<string, number>
}

// Pulls the real contribution calendar via GitHub's GraphQL API. Includes
// contributions to public AND private repos (and org repos) when the
// authenticated user is the same as GH_USER and the token carries `repo` +
// `read:user` scope. Without a token the API rejects unauthenticated GraphQL,
// so we return null and the page falls back to the placeholder calendar.
//
// GraphQL's contributionLevel comes as an enum (NONE / FIRST_QUARTILE / ...)
// which we collapse to 0-4.
const LEVEL_MAP: Record<string, 0 | 1 | 2 | 3 | 4> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
}

// Pulls every repo the viewer is involved in (owner public+private, plus org
// repos / external repos they've contributed to), with languages-by-bytes
// per repo, in a single GraphQL request. We use this for the inclusive
// "repos / languages" counters and language mix; the `topRepos` list stays
// public-only (handled separately) so we never display private names.
type RepoWithLangs = {
  name: string
  isPrivate: boolean
  langs: { name: string; size: number }[]
}

async function fetchAllAffiliationRepos(): Promise<RepoWithLangs[] | null> {
  if (!process.env.GITHUB_TOKEN) return null
  const query = `query AllRepos {
    viewer {
      repositories(
        first: 100
        isFork: false
        ownerAffiliations: [OWNER]
      ) {
        nodes {
          name
          isPrivate
          languages(first: 20, orderBy: { field: SIZE, direction: DESC }) {
            edges { size node { name } }
          }
        }
      }
      repositoriesContributedTo(
        first: 100
        includeUserRepositories: false
        contributionTypes: [COMMIT, PULL_REQUEST, REPOSITORY]
      ) {
        nodes {
          name
          isPrivate
          languages(first: 20, orderBy: { field: SIZE, direction: DESC }) {
            edges { size node { name } }
          }
        }
      }
    }
  }`
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ query }),
  })
  if (!res.ok) return null
  type RepoNode = {
    name: string
    isPrivate: boolean
    languages?: { edges: { size: number; node: { name: string } }[] }
  }
  const json = (await res.json()) as {
    data?: {
      viewer?: {
        repositories?: { nodes: RepoNode[] }
        repositoriesContributedTo?: { nodes: RepoNode[] }
      }
    }
  }
  const owned = json.data?.viewer?.repositories?.nodes ?? []
  const contributed = json.data?.viewer?.repositoriesContributedTo?.nodes ?? []
  // Dedupe (a contributed repo could in theory overlap with owned).
  const map = new Map<string, RepoWithLangs>()
  for (const r of [...owned, ...contributed]) {
    if (!r) continue
    const key = `${r.isPrivate ? 'priv' : 'pub'}::${r.name}`
    if (map.has(key)) continue
    map.set(key, {
      name: r.name,
      isPrivate: r.isPrivate,
      langs: (r.languages?.edges ?? []).map((e) => ({
        name: e.node.name,
        size: e.size,
      })),
    })
  }
  return Array.from(map.values())
}

async function fetchContribCalendar(): Promise<ContribCalendar | null> {
  if (!process.env.GITHUB_TOKEN) return null
  const query = `query Contribs($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
  }`
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ query, variables: { login: GH_USER } }),
  })
  if (!res.ok) return null
  const json = (await res.json()) as {
    data?: {
      user?: {
        contributionsCollection?: {
          contributionCalendar?: {
            totalContributions: number
            weeks: {
              contributionDays: {
                date: string
                contributionCount: number
                contributionLevel: string
              }[]
            }[]
          }
        }
      }
    }
  }
  const cal = json.data?.user?.contributionsCollection?.contributionCalendar
  if (!cal) return null
  const days: ContribDay[] = cal.weeks.flatMap((w) =>
    w.contributionDays.map((d) => ({
      date: d.date,
      count: d.contributionCount,
      level: LEVEL_MAP[d.contributionLevel] ?? 0,
    }))
  )
  // Streaks (current = trailing run of >0; longest = max run anywhere).
  let longest = 0
  let run = 0
  for (const d of days) {
    if (d.count > 0) {
      run++
      if (run > longest) longest = run
    } else {
      run = 0
    }
  }
  let current = 0
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) current++
    else break
  }
  return {
    totalContributions: cal.totalContributions,
    days,
    longestStreak: longest,
    currentStreak: current,
  }
}

// Tiny concurrency limiter so we don't fan-out 50 fetches at once.
async function pMap<T, R>(items: T[], n: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length)
  let i = 0
  async function worker(): Promise<void> {
    while (i < items.length) {
      const idx = i++
      out[idx] = await fn(items[idx])
    }
  }
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, worker))
  return out
}

async function buildStats(): Promise<HomeStats | null> {
  try {
    const [publicRepos, profile, contribCalendar, allRepos] = await Promise.all([
      fetchAllRepos(),
      fetchProfile(),
      fetchContribCalendar(),
      fetchAllAffiliationRepos(),
    ])
    if (!publicRepos.length) return null

    // Inclusive repo set (owner public+private + contributed orgs/external),
    // when available; falls back to public-only if GraphQL didn't land.
    const inclusiveRepos = allRepos ?? []
    const reposCount = inclusiveRepos.length || publicRepos.length

    // Aggregate languages by bytes. Prefer the GraphQL inclusive set; fall
    // back to per-public-repo REST fetches when the token can't reach
    // GraphQL.
    const langTotals: Record<string, number> = {}
    if (inclusiveRepos.length) {
      for (const r of inclusiveRepos) {
        for (const l of r.langs) {
          langTotals[l.name] = (langTotals[l.name] || 0) + l.size
        }
      }
    } else {
      const allLangs = await pMap(publicRepos, 6, (r) => fetchRepoLanguages(r.full_name))
      for (const langs of allLangs) {
        for (const [name, bytes] of Object.entries(langs)) {
          langTotals[name] = (langTotals[name] || 0) + (bytes as number)
        }
      }
    }
    const totalBytes = Object.values(langTotals).reduce((a, b) => a + b, 0) || 1

    const languageMix: LangSlice[] = Object.entries(langTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, bytes]) => ({
        name,
        pct: Math.max(1, Math.round((bytes / totalBytes) * 100)),
        color: colorFor(name),
      }))

    // Re-balance percentages so they sum to ~100 (rounding can drift a few pp).
    const sum = languageMix.reduce((a, l) => a + l.pct, 0)
    if (sum !== 100 && languageMix.length) {
      languageMix[0] = { ...languageMix[0], pct: languageMix[0].pct + (100 - sum) }
    }

    // Top repos by stars, falling back to most recently updated for the trailing slots.
    // Stays public-only on purpose so private/org repo names never leak.
    const topRepos: RepoCard[] = publicRepos
      .slice()
      .sort(
        (a, b) =>
          b.stargazers_count - a.stargazers_count || b.updated_at.localeCompare(a.updated_at)
      )
      .slice(0, 5)
      .map((r) => ({
        name: r.name,
        description: r.description || '',
        language: r.language || 'Other',
        color: colorFor(r.language || 'Other'),
        stars: r.stargazers_count,
        url: r.html_url,
      }))

    const created = new Date(profile.created_at)
    const yearsOnGithub = Math.max(0, new Date().getFullYear() - created.getFullYear())

    return {
      publicRepos: reposCount,
      languagesShipped: Object.keys(langTotals).length,
      yearsOnGithub,
      languageMix,
      topRepos,
      contribCalendar: contribCalendar ?? emptyCalendar(),
    }
  } catch {
    return null
  }
}

function emptyCalendar(): ContribCalendar {
  return { totalContributions: 0, days: [], longestStreak: 0, currentStreak: 0 }
}

// Public entry point - used by frontmatter in src/pages/index.astro and
// src/pages/es/index.astro. Returns cached stats if recent, refetches and
// rewrites cache when stale, falls back to stale cache if the refetch fails.
export async function loadHomeStats(): Promise<HomeStats> {
  const cached = readCache()
  const fresh = !cached || cacheAgeMs() > ONE_DAY ? await buildStats() : null
  if (fresh) {
    writeCache(fresh)
    return fresh
  }
  if (cached) return cached
  // Last-resort fallback so the build never fails. Counters animate to 0 if
  // none of the network paths land - visually the section just goes quiet.
  return {
    publicRepos: 0,
    languagesShipped: 0,
    yearsOnGithub: 0,
    languageMix: [],
    topRepos: [],
    contribCalendar: emptyCalendar(),
  }
}
