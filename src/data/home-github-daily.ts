// The home pages regenerate every few minutes (ISR) for the Strava section.
// The GitHub stats cost a dozen API calls and change slowly, so regenerations
// reuse one result per day from the Next data cache instead of refetching.
import { unstable_cache } from 'next/cache'

import { loadHomeStats } from './home-github'

export const loadHomeStatsDaily = unstable_cache(loadHomeStats, ['home-github-stats'], {
  revalidate: 86400,
})
