// Contribution calendar builders: GraphQL fetch, public-profile scrape, streaks.
import { GH_USER } from './dev-github'
import { authHeaders } from './home-github-fetch'
import type { ContribCalendar, ContribDay } from './home-github-types'

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
// GitHub serves the calendar as static HTML at /users/<user>/contributions -
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

export async function fetchContribCalendar(): Promise<ContribCalendar | null> {
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
