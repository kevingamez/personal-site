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
  followers: number
  following: number
  joinedISO: string // ISO date of GitHub account creation
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
type RawProfile = {
  created_at: string
  followers: number
  following: number
}

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
  // PUBLIC + OWNED only. Notes:
  //   - We ignore private repos for the language mix because the fine-grained
  //     PAT can't see Kevin's work orgs (Enttor / Samsam) so private bytes are
  //     dominated by old school projects (Jupyter notebooks etc.) and skew the
  //     mix in a way that doesn't represent his actual "shipping voice".
  //   - We also exclude `repositoriesContributedTo` for the same reason: PRs
  //     to external repos pull in foreign code.
  const query = `query OwnedPublic {
    viewer {
      repositories(
        first: 100
        isFork: false
        ownerAffiliations: [OWNER]
        privacy: PUBLIC
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
    data?: { viewer?: { repositories?: { nodes: RepoNode[] } } }
    errors?: unknown[]
  }
  // GraphQL returns HTTP 200 even on partial failure: a top-level `errors`
  // array (rate limit, missing scope, partial nulls) or a null viewer means
  // `data` can't be trusted. Bail to null so buildStats falls back to the
  // per-repo REST language path instead of reporting "0 languages".
  if ((json.errors && json.errors.length) || !json.data?.viewer) return null
  const owned = json.data.viewer.repositories?.nodes ?? []
  return owned.map((r) => ({
    name: r.name,
    isPrivate: r.isPrivate,
    langs: (r.languages?.edges ?? []).map((e) => ({ name: e.node.name, size: e.size })),
  }))
}

function streaksOf(days: ContribDay[]): { longest: number; current: number } {
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
  // Skip the most recent day when it's empty: "today" usually has no commits
  // yet early in the day, and that shouldn't zero out a streak that ran through
  // yesterday.
  let start = days.length - 1
  if (start >= 0 && days[start].count === 0) start--
  for (let i = start; i >= 0; i--) {
    if (days[i].count > 0) current++
    else break
  }
  return { longest, current }
}

async function fetchContribCalendarGraphQL(): Promise<ContribCalendar | null> {
  if (!process.env.GITHUB_TOKEN) return null
  // Explicit window: last 12 months ending today. Without `from`/`to` GitHub
  // returns the calendar year, which is shorter early in the year.
  const to = new Date()
  const from = new Date(to.getTime() - 365 * 24 * 60 * 60 * 1000)
  const query = `query Contribs($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        restrictedContributionsCount
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
    body: JSON.stringify({
      query,
      variables: { login: GH_USER, from: from.toISOString(), to: to.toISOString() },
    }),
  })
  if (!res.ok) return null
  const json = (await res.json()) as {
    data?: {
      user?: {
        contributionsCollection?: {
          restrictedContributionsCount?: number
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
  const cc = json.data?.user?.contributionsCollection
  const cal = cc?.contributionCalendar
  if (!cal) return null
  const days: ContribDay[] = cal.weeks.flatMap((w) =>
    w.contributionDays.map((d) => ({
      date: d.date,
      count: d.contributionCount,
      level: LEVEL_MAP[d.contributionLevel] ?? 0,
    }))
  )
  // `totalContributions` only counts what the *viewer* can see. If the token
  // can't reach private repos, `restrictedContributionsCount` is the number
  // of commits hidden from the calendar but real on the profile page. Adding
  // it gets us closer to GitHub's own visible count.
  const total = cal.totalContributions + (cc?.restrictedContributionsCount ?? 0)
  const { longest, current } = streaksOf(days)
  return { totalContributions: total, days, longestStreak: longest, currentStreak: current }
}

// Public-profile scraper used when the token can't see private contributions.
// GitHub serves the calendar as static HTML at /users/<user>/contributions —
// each cell is `<td class="ContributionCalendar-day" data-date="YYYY-MM-DD"
// data-level="0..4">` plus an adjacent `<tool-tip>N contributions on Mon Day,
// Year</tool-tip>`. We parse counts from the tooltip when present and fall
// back to a level-derived approximation.
async function fetchContribCalendarPublic(): Promise<ContribCalendar | null> {
  try {
    const res = await fetch(`https://github.com/users/${GH_USER}/contributions`, {
      headers: { 'User-Agent': 'personal-site-build', Accept: 'text/html' },
    })
    if (!res.ok) return null
    const html = await res.text()
    // GitHub's order varies (`data-date` may come before or after `id`), so
    // extract each cell tag, then read attributes individually.
    const cellRe = /<td\b[^>]*class="[^"]*ContributionCalendar-day[^"]*"[^>]*>/g
    const cells: { id: string | null; date: string; level: 0 | 1 | 2 | 3 | 4 }[] = []
    let m: RegExpExecArray | null
    while ((m = cellRe.exec(html)) !== null) {
      const tag = m[0]
      const date = tag.match(/data-date="([\d-]+)"/)?.[1]
      const level = tag.match(/data-level="(\d)"/)?.[1]
      const id = tag.match(/\sid="([^"]+)"/)?.[1] || null
      if (!date || !level) continue
      const lvl = parseInt(level, 10) as 0 | 1 | 2 | 3 | 4
      cells.push({ id, date, level: lvl })
    }
    if (!cells.length) return null
    // Tooltips: `<tool-tip ... for="cellId">N contributions on …</tool-tip>`
    // (or "No contributions on …"). Build id → count.
    const tipRe = /<tool-tip\b[^>]*\sfor="([^"]+)"[^>]*>([^<]+)<\/tool-tip>/g
    const counts = new Map<string, number>()
    while ((m = tipRe.exec(html)) !== null) {
      const id = m[1]
      const text = m[2]
      // Counts of 1000+ render with a thousands separator ("1,234 contributions"),
      // so allow commas in the match and strip them before parsing.
      const num = text.match(/^([\d,]+|No)\s+contribution/i)
      counts.set(
        id,
        num ? (num[1].toLowerCase() === 'no' ? 0 : parseInt(num[1].replace(/,/g, ''), 10)) : 0
      )
    }
    const days: ContribDay[] = cells.map((c) => {
      const known = c.id ? counts.get(c.id) : undefined
      // Level → approximate count if no tooltip matched (shouldn't happen on
      // current GitHub but covers HTML-shape changes).
      const fallback = c.level === 0 ? 0 : c.level * 2
      return { date: c.date, count: known ?? fallback, level: c.level }
    })
    days.sort((a, b) => a.date.localeCompare(b.date))
    const total = days.reduce((s, d) => s + d.count, 0)
    const { longest, current } = streaksOf(days)
    return { totalContributions: total, days, longestStreak: longest, currentStreak: current }
  } catch {
    return null
  }
}

async function fetchContribCalendar(): Promise<ContribCalendar | null> {
  // Prefer the public-profile scrape because it reflects what GitHub actually
  // shows on github.com/<user>: public contributions + private contributions
  // when the user enabled "Include private contributions on my profile".
  // GraphQL via fine-grained PATs only counts repos the token can read, so it
  // systematically undercounts (e.g. work repos at Enttor/Samsam).
  // GraphQL stays as a fallback when the HTML scrape can't reach GitHub
  // (network blocked, layout change, etc).
  const [pub, gql] = await Promise.all([
    fetchContribCalendarPublic(),
    fetchContribCalendarGraphQL(),
  ])
  if (pub && pub.days.length) return pub
  return gql
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

    // Repo count: strictly the public, non-fork count from REST. The
    // inclusive GraphQL set is used only for byte aggregation.
    const inclusiveRepos = allRepos ?? []
    const reposCount = publicRepos.length

    // Aggregate languages by bytes. Prefer the GraphQL set (only OWNED PUBLIC
    // because it carries per-repo language sizes in one round-trip), fall
    // back to per-repo REST fetches if the token can't reach GraphQL.
    //
    // We exclude Jupyter Notebook from the mix: GitHub measures notebooks by
    // raw byte size, but most of those bytes are base64-encoded output cells
    // (images, dataframes), not the actual code Kevin writes. Including it
    // makes a single ML notebook drown out a year of TypeScript.
    const SKIP_LANGS = new Set(['Jupyter Notebook'])
    const langTotals: Record<string, number> = {}
    if (inclusiveRepos.length) {
      for (const r of inclusiveRepos) {
        for (const l of r.langs) {
          if (SKIP_LANGS.has(l.name)) continue
          langTotals[l.name] = (langTotals[l.name] || 0) + l.size
        }
      }
    } else {
      const allLangs = await pMap(publicRepos, 6, (r) => fetchRepoLanguages(r.full_name))
      for (const langs of allLangs) {
        for (const [name, bytes] of Object.entries(langs)) {
          if (SKIP_LANGS.has(name)) continue
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
    // Elapsed *full* years, not a calendar-year subtraction (which overstates
    // tenure by up to a year, most visibly every January).
    const yearsOnGithub = Math.max(
      0,
      Math.floor((Date.now() - created.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    )

    return {
      publicRepos: reposCount,
      languagesShipped: Object.keys(langTotals).length,
      yearsOnGithub,
      followers: profile.followers,
      following: profile.following,
      joinedISO: profile.created_at,
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
// A result that has public repos but no language mix is degraded (a transient
// GraphQL/REST language-fetch failure). Don't let it overwrite a good prior
// snapshot for a full day.
function isComplete(s: HomeStats): boolean {
  return !(s.publicRepos > 0 && s.languageMix.length === 0)
}

export async function loadHomeStats(): Promise<HomeStats> {
  const cached = readCache()
  const fresh = !cached || cacheAgeMs() > ONE_DAY ? await buildStats() : null
  if (fresh && isComplete(fresh)) {
    writeCache(fresh)
    return fresh
  }
  // Fresh-but-degraded: prefer the (complete) stale cache; fall back to the
  // degraded result without caching it so the next build retries.
  if (cached) return cached
  if (fresh) return fresh
  // Last-resort fallback so the build never fails. Counters animate to 0 if
  // none of the network paths land - visually the section just goes quiet.
  return {
    publicRepos: 0,
    languagesShipped: 0,
    yearsOnGithub: 0,
    followers: 0,
    following: 0,
    joinedISO: '',
    languageMix: [],
    topRepos: [],
    contribCalendar: emptyCalendar(),
  }
}
