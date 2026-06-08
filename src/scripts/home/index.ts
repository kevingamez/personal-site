// Entry point for the home page (EN + ES share this - no string differences).
// Bundled by Astro and loaded with `<script>import '@/scripts/home/index.ts'`.

import { bootstrapClient } from '../lib/init'
import { track } from '../lib/analytics'
import { initBogotaClock } from '../clock'
import { initConway } from './conway'
import { initDevTransition } from './dev-transition'

bootstrapClient()
initBogotaClock()
initConway()
initDevTransition()

function runWhenIdle(fn: () => void, timeout = 2000): void {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(fn, { timeout })
    return
  }
  setTimeout(fn, Math.min(timeout, 1200))
}

function once(fn: () => void): () => void {
  let ran = false
  return () => {
    if (ran) return
    ran = true
    fn()
  }
}

function loadLazy(task: () => Promise<void>): void {
  void task().catch(() => {
    // Lazy modules are progressive enhancement. If a chunk is unavailable
    // during a deploy, the SSR content remains usable and no rejection leaks.
  })
}

function whenVisible(selector: string, fn: () => void, rootMargin = '600px 0px'): () => void {
  const run = once(fn)
  const el = document.querySelector<HTMLElement>(selector)
  if (!el || typeof IntersectionObserver === 'undefined') {
    run()
    return run
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        io.disconnect()
        run()
        break
      }
    },
    { rootMargin, threshold: 0 }
  )
  io.observe(el)
  return run
}

whenVisible(
  '#github',
  () => {
    loadLazy(async () => {
      const [contrib, ghStats] = await Promise.all([import('./contrib'), import('./gh-stats')])
      contrib.initContribGraph()
      ghStats.initGhStats()
    })
  },
  '700px 0px'
)

whenVisible(
  '[data-strava-lazy-anchor]',
  () => {
    loadLazy(async () => {
      const strava = await import('./strava')
      await strava.initStrava()
    })
  },
  '900px 0px'
)

whenVisible(
  '#writing',
  () => {
    loadLazy(async () => {
      const writing = await import('./writing')
      writing.initWriting()
    })
  },
  '700px 0px'
)

const loadConsole = whenVisible(
  '#console',
  () => {
    loadLazy(async () => {
      const consoleModule = await import('./console')
      consoleModule.initConsole()
    })
  },
  '700px 0px'
)
document.getElementById('console-msg')?.addEventListener('focus', loadConsole, { once: true })

runWhenIdle(() => {
  loadLazy(async () => {
    const visibility = await import('./visibility')
    visibility.initVisibility()
  })
  loadLazy(async () => {
    const reveal = await import('./reveal')
    reveal.initReveal()
  })
}, 1800)

const langLink = document.querySelector<HTMLAnchorElement>('a.lang')
if (langLink) {
  langLink.addEventListener('click', () => {
    const from = document.documentElement.lang || 'en'
    const to = from === 'en' ? 'es' : 'en'
    track<{ name: 'lang_switch'; props: { from: string; to: string } }>('lang_switch', { from, to })
  })
}
