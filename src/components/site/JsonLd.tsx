// Structured data for the home pages.
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
          'Founding engineer in Bogotá, Colombia, open to new roles. Previously founding engineer at Enttor and at Samsam. M.Sc. Information Engineering (deep-learning specialization), Universidad de los Andes.',
        email: 'kevingamez.kg@gmail.com',
        seeks: {
          '@type': 'Demand',
          name: 'Founding engineer and senior full-stack roles',
        },
        // No `worksFor`: that property asserts a current employer. Past roles
        // are expressed as OrganizationRole with explicit end dates.
        hasOccupation: [
          {
            '@type': 'OrganizationRole',
            roleName: 'Founding Engineer',
            startDate: '2025-06',
            endDate: '2026-07',
            memberOf: {
              '@type': 'Organization',
              '@id': 'https://www.enttor.ai/#org',
              name: 'Enttor',
              url: 'https://www.enttor.ai/',
              sameAs: ['https://www.linkedin.com/company/enttor/'],
            },
          },
          {
            '@type': 'OrganizationRole',
            roleName: 'Product Engineer',
            startDate: '2024-02',
            endDate: '2025-03',
            memberOf: { '@type': 'Organization', name: 'Samsam' },
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
          addressRegion: 'Bogotá D.C.',
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
          },
        ],
        hasCredential: [
          {
            '@type': 'EducationalOccupationalCredential',
            credentialCategory: 'degree',
            name: 'M.Sc. Information Engineering (deep-learning specialization)',
            educationalLevel: 'Master degree',
            recognizedBy: { '@type': 'CollegeOrUniversity', name: 'Universidad de los Andes' },
          },
          {
            '@type': 'EducationalOccupationalCredential',
            credentialCategory: 'degree',
            name: 'B.Sc. Systems and Computing Engineering',
            educationalLevel: 'Bachelor degree',
            recognizedBy: { '@type': 'CollegeOrUniversity', name: 'Universidad de los Andes' },
          },
          {
            '@type': 'EducationalOccupationalCredential',
            credentialCategory: 'certificate',
            name: 'AWS Academy Cloud Developing',
            recognizedBy: { '@type': 'Organization', name: 'Amazon Web Services' },
          },
        ],
        award: [
          'Andrés Bello National Distinction',
          'AWS Academy Cloud Foundations',
          'AWS Academy Cloud Developing',
        ],
        sameAs: [
          'https://www.linkedin.com/in/kevin-gamez/',
          'https://github.com/kevingamez',
          'https://x.com/KevinGamezA',
          'https://www.strava.com/athletes/70612862',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://kevingamez.co/#site',
        url: 'https://kevingamez.co/',
        name: 'Kevin Gámez',
        inLanguage: ['en', 'es'],
        publisher: { '@id': 'https://kevingamez.co/#kevin' },
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
