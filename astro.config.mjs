// https://astro.build/config
import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://kevingamez.com',
  integrations: [sitemap()],
  devToolbar: { enabled: false },
})
