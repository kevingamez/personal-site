// Entry point for the home page (EN + ES share this - no string differences).
// Bundled by Astro and loaded with `<script>import '@/scripts/home/index.ts'`.

import { bootstrapClient } from '../lib/init'
import { track } from '../lib/analytics'
import { initConway } from './conway'
import { initContribGraph } from './contrib'
import { initGhStats } from './gh-stats'
import { initConsole } from './console'
import { initWriting } from './writing'
import { initVisibility } from './visibility'
import { initDevTransition } from './dev-transition'

bootstrapClient()
initConway()
initContribGraph()
initGhStats()
initWriting()
initConsole()
initVisibility()
initDevTransition()

const langLink = document.querySelector<HTMLAnchorElement>('a.lang')
if (langLink) {
  langLink.addEventListener('click', () => {
    const from = document.documentElement.lang || 'en'
    const to = from === 'en' ? 'es' : 'en'
    track<{ name: 'lang_switch'; props: { from: string; to: string } }>('lang_switch', { from, to })
  })
}
