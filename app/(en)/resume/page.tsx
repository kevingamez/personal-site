import type { Metadata } from 'next'
import { en } from '@/content/home-en'
import { resumeEn } from '@/content/resume-en'
import { buildMetadata } from '@/lib/seo'
import { ResumeArticle } from '@/components/resume/ResumeArticle'
import '@/styles/home/index.css'
import '@/styles/resume.css'

const description =
  'Résumé of Kevin Gámez, founding engineer at Enttor. AI-native product engineering: TypeScript, Next.js, NestJS, Postgres, LLM agents and pipelines.'

const meta = {
  ...en.meta,
  title: 'Résumé, Kevin Gámez',
  ogTitle: 'Résumé, Kevin Gámez',
  twitterTitle: 'Résumé, Kevin Gámez',
  description,
  ogDescription: description,
  twitterDescription: description,
  canonical: 'https://kevingamez.co/resume/',
  ogUrl: 'https://kevingamez.co/resume/',
  includeJsonLd: false,
  // Translated page: point at its Spanish twin so the pair is one cluster.
  hreflang: [
    { lang: 'en', href: 'https://kevingamez.co/resume/' },
    { lang: 'es', href: 'https://kevingamez.co/es/resume/' },
    { lang: 'x-default', href: 'https://kevingamez.co/resume/' },
  ],
}

export const metadata: Metadata = buildMetadata(meta)

export default function Page() {
  return <ResumeArticle t={resumeEn} description={description} homeHref="/" />
}
