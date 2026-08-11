import type { Metadata } from 'next'
import { en } from '@/content/home-en'
import { buildMetadata } from '@/lib/seo'
import '@/styles/home/index.css'
import '@/styles/resume.css'

const meta = {
  ...en.meta,
  title: 'Résumé · Kevin Gámez',
  ogTitle: 'Résumé · Kevin Gámez',
  twitterTitle: 'Résumé · Kevin Gámez',
  description:
    'Résumé of Kevin Gámez: founding engineer at a MaC Venture Capital-backed startup, AI-native product engineering, TypeScript / Next.js / Postgres.',
  ogDescription:
    'Résumé of Kevin Gámez: founding engineer at a MaC Venture Capital-backed startup, AI-native product engineering, TypeScript / Next.js / Postgres.',
  twitterDescription:
    'Résumé of Kevin Gámez: founding engineer at a MaC Venture Capital-backed startup, AI-native product engineering, TypeScript / Next.js / Postgres.',
  canonical: 'https://kevingamez.co/resume/',
  ogUrl: 'https://kevingamez.co/resume/',
  includeJsonLd: false,
  // Standalone, English-only page: same convention as /privacy.
  hreflang: [],
}

export const metadata: Metadata = buildMetadata(meta)

// Content mirrors public/docs/Kevin-Gamez-CV.pdf - keep both in sync.
const experience = [
  {
    role: 'Founding Engineer',
    at: 'Enttor',
    dates: 'Jun 2024 – Present',
    meta: 'Bogotá, COL',
    bullets: [
      'Owned the entire engineering function on a six-person team; architected, developed, and maintained the platform behind $160K+ in 2026 revenue.',
      'Operated an AI-native development process: defined specs, directed LLM code generation, and gated every release through review and QA; sustained 3-day build-test-ship cycles with weekly client feedback sessions.',
      'Engineered an AI ad-creation platform with Figma-style layer editing (OCR, image segmentation, 30-ad batch generation); rebuilt the pipeline on GPUs, cutting generation time from 11 minutes to under 2, over 5x faster.',
      'Automated candidate and prospect sourcing: built browser agents screening profiles by university, employer, and founder background, plus a Slack-native AI agent managing ad operations across Meta, TikTok, and Google Ads.',
    ],
  },
  {
    role: 'Product Engineer',
    at: 'Samsam',
    dates: 'Feb 2024 – Mar 2025',
    meta: 'Bogotá, COL',
    bullets: [
      'Developed and deployed features across multiple platforms, including shopper and merchant applications.',
      'Designed and implemented scalable front-end and back-end solutions using TypeScript, React Native, Next.js, Prisma, and PostgreSQL.',
      'Refactored core backend services, improving performance, reliability, and maintainability of the e-commerce platform.',
    ],
  },
]

const education = [
  {
    role: 'M.Sc. Information Engineering',
    at: 'Universidad de los Andes',
    dates: 'May 2025',
    meta: 'Bogotá, COL',
    bullets: [
      'Relevant coursework: big data, recommender systems, business analytics, deep learning, cloud development.',
    ],
  },
  {
    role: 'B.Sc. Systems and Computer Engineering',
    at: 'Universidad de los Andes',
    dates: 'Dec 2023',
    meta: 'Bogotá, COL',
    bullets: [
      'Relevant coursework: systems programming, data structures and algorithms, business analytics, web development, mobile development.',
    ],
  },
  {
    role: 'Minors in Mathematics and Management',
    at: 'Universidad de los Andes',
    dates: 'Dec 2022 · Dec 2023',
    meta: 'Bogotá, COL',
    bullets: [],
  },
]

function Entry({ e }: { e: (typeof experience)[number] }) {
  return (
    <div className="resume-entry">
      <div className="resume-entry-head">
        <h3>
          {e.role} <span className="at">· {e.at}</span>
        </h3>
        <span className="resume-dates">{e.dates}</span>
      </div>
      <p className="resume-meta">{e.meta}</p>
      {e.bullets.length > 0 && (
        <ul>
          {e.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function Page() {
  return (
    <main className="resume-page">
      <article className="wrap resume-article">
        <header>
          <p className="kicker">Résumé</p>
          <h1>Kevin Gámez</h1>
          <p className="resume-contact">
            Bogotá, Colombia · <a href="mailto:kevingamez.kg@gmail.com">kevingamez.kg@gmail.com</a>{' '}
            · <a href="https://github.com/kevingamez">GitHub</a> ·{' '}
            <a href="https://co.linkedin.com/in/kevin-gamez/">LinkedIn</a> ·{' '}
            <a className="resume-pdf" href="/docs/Kevin-Gamez-CV.pdf">
              Download PDF
            </a>
          </p>
          <p className="resume-summary">
            Founding Engineer at a MaC Venture Capital-backed startup (2024–2026). End-to-end owner
            of product and platform. Relentless execution, exacting attention to detail, concise
            communication.
          </p>
        </header>

        <h2>Experience</h2>
        {experience.map((e) => (
          <Entry key={e.role + e.at} e={e} />
        ))}

        <h2>Education</h2>
        {education.map((e) => (
          <Entry key={e.role} e={e} />
        ))}

        <h2>Skills</h2>
        <dl className="resume-skills">
          <dt>AI</dt>
          <dd>
            LLM agents, prompt engineering, OpenAI/Anthropic APIs, OCR, image segmentation, PyTorch.
          </dd>
          <dt>Engineering</dt>
          <dd>TypeScript, Next.js, NestJS, React Native, Python, Postgres, ETL, AWS.</dd>
        </dl>

        <a className="resume-back" href="/">
          ← back to kevingamez.co
        </a>
      </article>
    </main>
  )
}
