import type { MetadataRoute } from 'next'

// Indexable routes only (/dev is noindex, /lab is unlisted).
//
// lastModified gives crawlers a recrawl signal. It is stamped at build time,
// so every deploy tells Google the pages are fresh; that is accurate here
// because a deploy is the only way this content changes.

const lastModified = new Date()

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://kevingamez.co/', lastModified, changeFrequency: 'monthly', priority: 1 },
    { url: 'https://kevingamez.co/es/', lastModified, changeFrequency: 'monthly', priority: 0.9 },
    {
      url: 'https://kevingamez.co/resume/',
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://kevingamez.co/es/resume/',
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://kevingamez.co/privacy/',
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ]
}
