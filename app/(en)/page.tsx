import type { Metadata } from 'next'
import { en } from '@/content/home-en'
import { loadHomeStats } from '@/data/home-github'
import { buildMetadata } from '@/lib/seo'
import { HomePage } from '@/components/home/HomePage'

export const metadata: Metadata = buildMetadata(en.meta)

export default async function Page() {
  const stats = await loadHomeStats()
  return <HomePage t={en} stats={stats} />
}
