// Entry point for the home page (EN + ES share this - no string differences).
// Bundled by Astro and loaded with `<script>import '@/scripts/home/index.ts'`.

import { bootstrapClient } from '../lib/init'
import { initBogotaClock } from '../clock'
import { initConway } from './conway'
import { initExperience } from './experience'
import { initIntro } from './intro'
import { initShare } from './share'

bootstrapClient()
initIntro()
initBogotaClock()
void import('./weather').then((m) => m.initWeather())
initConway()

// Eager, not lazy: the rows must collapse before they can scroll into view,
// otherwise an anchor jump to #experience lands on four open panels.
initExperience()

// Eager too, and for the same class of reason: the sticky bar decides whether
// to show from the current scroll position, so it has to be listening before
// the visitor has scrolled anywhere. It is a handful of listeners, no chunk.
initShare()

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
  '#work',
  () => {
    loadLazy(async () => {
      const m = await import('./ad-studio')
      m.initAdStudio()
    })
  },
  '600px 0px'
)

// Section commented out in HomePage.tsx. whenVisible() runs its callback
// immediately when the anchor is missing, so leaving this wired would download
// the chart chunk on every load for markup that is not there.
// whenVisible(
//   '#github',
//   () => {
//     loadLazy(async () => {
//       const [ghStats, yearRun] = await Promise.all([import('./gh-stats'), import('./year-run')])
//       ghStats.initGhStats()
//       yearRun.initYearRun()
//     })
//   },
//   '700px 0px'
// )

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

// A second WebGL context on a page that already runs one, so it waits until the
// box is actually near the viewport.
whenVisible(
  '[data-moments-lazy]',
  () => {
    loadLazy(async () => {
      const moments = await import('./moments')
      moments.initMoments()
    })
  },
  '400px 0px'
)

// Section commented out in HomePage.tsx, same reason as the GitHub block.
// whenVisible(
//   '#writing',
//   () => {
//     loadLazy(async () => {
//       const writing = await import('./writing')
//       writing.initWriting()
//     })
//   },
//   '700px 0px'
// )

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
