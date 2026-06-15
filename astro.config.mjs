// https://astro.build/config
import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://kevingamez.co',
  integrations: [
    sitemap({
      // Keep the /dev easter egg out of the index, and emit hreflang alternates
      // for the bilingual home pages so the en/es/x-default cluster is reinforced.
      filter: (page) => !page.includes('/dev'),
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', es: 'es' },
      },
    }),
  ],
  devToolbar: { enabled: false },
})
