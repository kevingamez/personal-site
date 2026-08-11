import type { Metadata } from 'next'
import { es } from '@/content/home-es'
import { loadHomeStats } from '@/data/home-github'
import { buildMetadata } from '@/lib/seo'
import { HomePage } from '@/components/home/HomePage'

export const metadata: Metadata = buildMetadata(es.meta)

export default async function Page() {
  const stats = await loadHomeStats()
  return <HomePage t={es} stats={stats} />
}
