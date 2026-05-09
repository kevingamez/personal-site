// https://astro.build/config
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://kevingamez.com',
  integrations: [preact(), sitemap()],
});
