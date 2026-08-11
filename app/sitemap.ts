import type { MetadataRoute } from 'next'

// Mirrors the sitemap @astrojs/sitemap generated: the indexable routes only
// (/dev is noindex, /lab is unlisted).

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://kevingamez.co/' },
    { url: 'https://kevingamez.co/es/' },
    { url: 'https://kevingamez.co/privacy/' },
  ]
}
