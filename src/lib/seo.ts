// Builds the Next.js Metadata object from the locale's typed meta strings -
// the data behind every page's <head> tags.

import type { Metadata } from 'next'
import type { HomeStrings } from '@/content/home'

const OG_IMAGE = 'https://kevingamez.co/og-dev-preview.png'
const OG_IMAGE_ALT = 'Kevin Gámez, founding engineer at Enttor'

export function buildMetadata(meta: HomeStrings['meta']): Metadata {
  const languages: Record<string, string> = {}
  for (const alt of meta.hreflang) languages[alt.lang] = alt.href

  const isProfile = (meta.ogType ?? 'profile') === 'profile'
  // A page with no hreflang cluster has no translation, so it must not claim
  // an alternate locale either.
  const hasAlternate = meta.hreflang.length > 0

  return {
    metadataBase: new URL('https://kevingamez.co'),
    title: meta.title,
    description: meta.description,
    authors: [{ name: 'Kevin Gámez' }],
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
    alternates: {
      canonical: meta.canonical,
      languages,
    },
    openGraph: {
      ...(isProfile
        ? {
            type: 'profile' as const,
            firstName: 'Kevin',
            lastName: 'Gámez',
            username: 'kevingamez',
          }
        : { type: 'website' as const }),
      url: meta.ogUrl,
      title: meta.ogTitle,
      description: meta.ogDescription,
      siteName: 'Kevin Gámez',
      locale: meta.ogLocale,
      ...(hasAlternate ? { alternateLocale: [meta.ogLocaleAlternate] } : {}),
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: OG_IMAGE_ALT, type: 'image/png' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.twitterTitle,
      description: meta.twitterDescription,
      creator: '@KevinGamezA',
      images: [{ url: OG_IMAGE, alt: OG_IMAGE_ALT }],
    },
    icons: {
      icon: [
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
      ],
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    },
    other: {
      'geo.region': 'CO-DC',
      'geo.placename': 'Bogotá',
      'geo.position': '4.711;-74.0721',
      ICBM: '4.711, -74.0721',
    },
  }
}
