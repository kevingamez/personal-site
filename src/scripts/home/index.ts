// Entry point for the home page (EN + ES share this — no string differences).
// Bundled by Astro and loaded with `<script>import '@/scripts/home/index.ts'`.

import { initConway } from './conway'
import { initContribGraph } from './contrib'

initConway()
initContribGraph()
