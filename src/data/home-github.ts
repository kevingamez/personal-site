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
//
// Barrel: implementation lives in home-github-types.ts, home-github-fetch.ts,
// home-github-calendar.ts, and home-github-stats.ts.
export type {
  LangSlice,
  RepoCard,
  ContribDay,
  ContribCalendar,
  HomeStats,
} from './home-github-types'
export { loadHomeStats } from './home-github-stats'
