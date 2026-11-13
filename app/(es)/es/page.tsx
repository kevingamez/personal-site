import type { Metadata } from 'next'
import { es } from '@/content/home-es'
import { loadHomeStatsDaily } from '@/data/home-github-daily'
import { buildMetadata } from '@/lib/seo'
import { loadHomeStrava } from '../../api/strava/strava-snapshot'
import { HomePage } from '@/components/home/HomePage'

export const metadata: Metadata = buildMetadata(es.meta)

// ISR: the page is rebuilt at most every 10 minutes, matching the Strava
// snapshot's own cache window, so the section ships with fresh-enough data.
export const revalidate = 600

export default async function Page() {
  const [stats, strava] = await Promise.all([loadHomeStatsDaily(), loadHomeStrava()])
  return <HomePage t={es} stats={stats} strava={strava} />
}
