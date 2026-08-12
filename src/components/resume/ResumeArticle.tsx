// The résumé markup, shared by /resume/ and /es/resume/. Both locales render
// the same structure; everything a reader sees comes from ResumeStrings.

import { Fragment } from 'react'
import type { ResumeEntry, ResumeStrings } from '@/content/resume'

function Entry({ e }: { e: ResumeEntry }) {
  return (
    <div className="resume-entry">
      <div className="resume-entry-head">
        <h3>
          {e.role} <span className="at">, {e.at}</span>
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

// The résumé is the page a recruiter or an AI assistant is most likely to cite,
// so it carries its own graph. It reuses the #kevin @id from the home page, so
// crawlers merge every page into one entity instead of inventing several people.
function jsonLd(t: ResumeStrings, description: string): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfilePage',
        '@id': `${t.pageUrl}#page`,
        url: t.pageUrl,
        inLanguage: t.jsonLdLang,
        name: t.jsonLdName,
        description,
        isPartOf: { '@id': 'https://kevingamez.co/#site' },
        about: { '@id': 'https://kevingamez.co/#kevin' },
        mainEntity: { '@id': 'https://kevingamez.co/#kevin' },
        breadcrumb: { '@id': `${t.pageUrl}#breadcrumb` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${t.pageUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Kevin Gámez', item: 'https://kevingamez.co/' },
          { '@type': 'ListItem', position: 2, name: t.breadcrumbLabel },
        ],
      },
      {
        '@type': 'Person',
        '@id': 'https://kevingamez.co/#kevin',
        name: 'Kevin Gámez',
        jobTitle: 'Founding Engineer',
        email: 'kevingamez.kg@gmail.com',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Bogotá',
          addressRegion: 'Bogotá D.C.',
          addressCountry: 'CO',
        },
        sameAs: [
          'https://www.linkedin.com/in/kevin-gamez/',
          'https://github.com/kevingamez',
          'https://x.com/KevinGamezA',
        ],
        hasOccupation: t.experience.map((e) => ({
          '@type': 'OrganizationRole',
          roleName: e.role,
          description: e.bullets.join(' '),
          memberOf: { '@type': 'Organization', name: e.at },
        })),
        knowsAbout: [
          'LLM agents',
          'Prompt engineering',
          'Browser automation',
          'OCR',
          'Image segmentation',
          'TypeScript',
          'Next.js',
          'NestJS',
          'React Native',
          'Python',
          'PostgreSQL',
          'AWS',
        ],
      },
    ],
  })
}

interface Props {
  t: ResumeStrings
  description: string
  homeHref: string
}

export function ResumeArticle({ t, description, homeHref }: Props) {
  return (
    <main className="resume-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(t, description) }}
      />
      <article className="wrap resume-article">
        <header>
          <p className="kicker">{t.kicker}</p>
          <h1>{t.name}</h1>
          <p className="resume-contact">
            {t.contactLocation},{' '}
            <a href="mailto:kevingamez.kg@gmail.com">kevingamez.kg@gmail.com</a>,{' '}
            <a href="https://github.com/kevingamez">GitHub</a>,{' '}
            <a href="https://www.linkedin.com/in/kevin-gamez/">LinkedIn</a>
          </p>
          <p className="resume-summary">{t.summary}</p>
          <a
            className="btn btn-primary resume-download"
            href="/docs/Kevin-Gamez-CV.pdf"
            download={t.downloadFileName}
          >
            {t.download}
          </a>
        </header>

        <h2>{t.headings.experience}</h2>
        {t.experience.map((e) => (
          <Entry key={e.role + e.at} e={e} />
        ))}

        <h2>{t.headings.education}</h2>
        {t.education.map((e) => (
          <Entry key={e.role} e={e} />
        ))}

        <h2>{t.headings.skills}</h2>
        <dl className="resume-skills">
          {t.skills.map((s) => (
            <Fragment key={s.term}>
              <dt>{s.term}</dt>
              <dd>{s.desc}</dd>
            </Fragment>
          ))}
        </dl>

        <a className="resume-back" href={homeHref}>
          {t.back}
        </a>
      </article>
    </main>
  )
}
