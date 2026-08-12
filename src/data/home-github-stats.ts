// Disk cache, stat aggregation (buildStats), and the loadHomeStats entry point.
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { GH_USER } from './dev-github'
import { projectRoot } from './dev-files'
import { colorFor } from './home-github-types'
import type { ContribCalendar, HomeStats, LangSlice, RepoCard } from './home-github-types'
import {
  fetchAllAffiliationRepos,
  fetchAllRepos,
  fetchProfile,
  fetchRepoLanguages,
} from './home-github-fetch'
import { fetchContribCalendar } from './home-github-calendar'

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

    // Curated showcase. Stays public-only so private/org names never leak, and
    // never surfaces the profile-README repo or undescribed coursework dumps.
    // Featured names rank first (in this order); then repos that actually
    // describe themselves; then by stars and recency.
    const FEATURED = [
      'personal-site',
      'AD_ASTRA2023-SpaceInvaders',
      'Palladium_Chat',
      'budget-app',
      'GCP-CloudRun',
    ]
    const featuredRank = (name: string): number => {
      const i = FEATURED.indexOf(name)
      return i === -1 ? FEATURED.length : i
    }
    const isProfileRepo = (name: string): boolean => name.toLowerCase() === GH_USER.toLowerCase()
    const topRepos: RepoCard[] = publicRepos
      .slice()
      .filter((r) => !isProfileRepo(r.name))
      .sort((a, b) => {
        const fr = featuredRank(a.name) - featuredRank(b.name)
        if (fr !== 0) return fr
        const da = a.description ? 0 : 1
        const db = b.description ? 0 : 1
        if (da !== db) return da - db
        return b.stargazers_count - a.stargazers_count || b.updated_at.localeCompare(a.updated_at)
      })
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

// Public entry point - used by the home routes app/(en)/page.tsx and
// app/(es)/es/page.tsx. Returns cached stats if recent, refetches and
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
