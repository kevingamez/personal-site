// GitHub REST/GraphQL fetch helpers: auth headers, repos, profile, languages.
import { GH_USER } from './dev-github'

export function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
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

export async function fetchAllRepos(): Promise<RawRepo[]> {
  // Owner type, public only, paginated. Personal-account ceiling is rarely past
  // 100 so we hit a single page; if needed, walk Link headers in the future.
  const url = `https://api.github.com/users/${GH_USER}/repos?per_page=100&sort=updated&type=owner`
  const res = await fetch(url, { headers: authHeaders() })
  if (!res.ok) throw new Error(`repos: ${res.status}`)
  const json = (await res.json()) as RawRepo[]
  if (!Array.isArray(json)) return []
  return json.filter((r) => !r.fork)
}
export async function fetchProfile(): Promise<RawProfile> {
  const res = await fetch(`https://api.github.com/users/${GH_USER}`, { headers: authHeaders() })
  if (!res.ok) throw new Error(`profile: ${res.status}`)
  return (await res.json()) as RawProfile
}
export async function fetchRepoLanguages(fullName: string): Promise<Record<string, number>> {
  const res = await fetch(`https://api.github.com/repos/${fullName}/languages`, {
    headers: authHeaders(),
  })
  if (!res.ok) return {}
  return (await res.json()) as Record<string, number>
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

export async function fetchAllAffiliationRepos(): Promise<RepoWithLangs[] | null> {
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
