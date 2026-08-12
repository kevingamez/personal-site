import type { Metadata } from 'next'
import { es } from '@/content/home-es'
import { resumeEs } from '@/content/resume-es'
import { buildMetadata } from '@/lib/seo'
import { ResumeArticle } from '@/components/resume/ResumeArticle'
import '@/styles/home/index.css'
import '@/styles/resume.css'

const description =
  'Hoja de vida de Kevin Gámez, founding engineer en Enttor, Bogotá. Ingeniería de producto AI-native: TypeScript, Next.js, NestJS, Postgres, pipelines con LLMs.'

const meta = {
  ...es.meta,
  title: 'Hoja de vida, Kevin Gámez',
  ogTitle: 'Hoja de vida, Kevin Gámez',
  twitterTitle: 'Hoja de vida, Kevin Gámez',
  description,
  ogDescription: description,
  twitterDescription: description,
  canonical: 'https://kevingamez.co/es/resume/',
  ogUrl: 'https://kevingamez.co/es/resume/',
  includeJsonLd: false,
  // Translated page: point at its English twin so the pair is one cluster.
  hreflang: [
    { lang: 'en', href: 'https://kevingamez.co/resume/' },
    { lang: 'es', href: 'https://kevingamez.co/es/resume/' },
    { lang: 'x-default', href: 'https://kevingamez.co/resume/' },
  ],
}

export const metadata: Metadata = buildMetadata(meta)

export default function Page() {
  return <ResumeArticle t={resumeEs} description={description} homeHref="/es/" />
}
