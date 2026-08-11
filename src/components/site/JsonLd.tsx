// Structured data for the home pages, ported verbatim from Layout.astro.
// The graph is static, trusted content - never sourced from user input.

import type { HomeStrings } from '@/content/home'

export function JsonLd({ meta }: { meta: HomeStrings['meta'] }) {
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': 'https://kevingamez.co/#kevin',
        name: 'Kevin Gámez',
        givenName: 'Kevin',
        familyName: 'Gámez',
        alternateName: 'Kevin Gamez',
        url: 'https://kevingamez.co',
        image: 'https://kevingamez.co/og-dev-preview.png',
        jobTitle: 'Founding Engineer',
        description:
          'Founding engineer at Enttor (AI-powered outbound: browser automation, OpenAI pipelines). M.Sc. Information Engineering (deep-learning specialization), Universidad de los Andes.',
        email: 'mailto:kevingamez.kg@gmail.com',
        worksFor: {
          '@type': 'Organization',
          '@id': 'https://www.enttor.ai/#org',
          name: 'Enttor',
          url: 'https://www.enttor.ai/',
          description: 'AI-powered outbound platform · browser automation, LLM pipelines.',
        },
        hasOccupation: [
          {
            '@type': 'Occupation',
            name: 'Founding Engineer',
            occupationLocation: { '@type': 'City', name: 'Bogotá' },
            skills:
              'TypeScript, Next.js, NestJS, Prisma, PostgreSQL, Supabase, Inngest, OpenAI, browser automation, LLM pipelines',
          },
        ],
        knowsAbout: [
          'AI outbound',
          'Browser automation',
          'LLM pipelines',
          'TypeScript',
          'Next.js',
          'NestJS',
          'Prisma',
          'PostgreSQL',
          'Python',
          'Deep learning',
          'Computer vision',
          'OpenCV',
          'YOLOv5',
          'FastAPI',
          'Cellular automata',
        ],
        knowsLanguage: [
          { '@type': 'Language', name: 'Spanish', alternateName: 'es' },
          { '@type': 'Language', name: 'English', alternateName: 'en' },
        ],
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Bogotá',
          addressRegion: 'Cundinamarca',
          addressCountry: 'CO',
        },
        homeLocation: {
          '@type': 'Place',
          name: 'Bogotá, Colombia',
          geo: { '@type': 'GeoCoordinates', latitude: 4.711, longitude: -74.0721 },
        },
        alumniOf: [
          {
            '@type': 'CollegeOrUniversity',
            name: 'Universidad de los Andes',
            url: 'https://uniandes.edu.co/',
            department:
              'M.Sc. Information Engineering (deep-learning specialization), 2024–2025; B.Sc. Systems and Computing, 2019–2023; Minor in Management',
          },
        ],
        award: [
          'Andrés Bello National Distinction',
          'AWS Academy Cloud Foundations',
          'AWS Academy Cloud Developing',
        ],
        sameAs: ['https://co.linkedin.com/in/kevin-gamez/', 'https://github.com/kevingamez'],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://kevingamez.co/#site',
        url: 'https://kevingamez.co/',
        name: 'Kevin Gámez',
        inLanguage: ['en', 'es'],
        publisher: { '@id': 'https://kevingamez.co/#kevin' },
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://kevingamez.co/?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'ProfilePage',
        '@id': meta.canonical + '#page',
        url: meta.canonical,
        inLanguage: meta.htmlLang,
        name: meta.ogTitle,
        description: meta.ogDescription,
        isPartOf: { '@id': 'https://kevingamez.co/#site' },
        about: { '@id': 'https://kevingamez.co/#kevin' },
        mainEntity: { '@id': 'https://kevingamez.co/#kevin' },
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['h1', '.hero-lede', '.about-prose'],
        },
      },
    ],
  })

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
}
