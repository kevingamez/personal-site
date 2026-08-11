// Profile panel widgets (Bogotá clock, uptime, started-at) and the initProfileSettings entry point.

import { formatBogotaTime } from '@/scripts/clock'
import {
  soundOn,
  keypressBeep,
  bindThemeButtons,
  bindFontSize,
  bindCursor,
  bindToggles,
  bindReset,
  restoreSettings,
} from './profile-settings-panel'

// ─── Profile widgets ───────────────────────────────────────────────────
// Reduced-motion gating + stored handles, mirroring the other dev widgets. The
// values still render once (a static frame) for reduce users; only the ticking
// is suppressed, and the handles stay clearable.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
let uptimeTimer: ReturnType<typeof setInterval> | null = null
let clockTimer: ReturnType<typeof setInterval> | null = null

function startUptime(startedAt: number): void {
  const el = document.getElementById('pf-uptime')
  if (!el) return
  const tick = (): void => {
    const s = Math.floor((Date.now() - startedAt) / 1000)
    const m = Math.floor(s / 60)
    const h = Math.floor(m / 60)
    if (h) el.textContent = `${h}h ${m % 60}m`
    else if (m) el.textContent = `${m}m ${s % 60}s`
    else el.textContent = `${s}s`
  }
  tick()
  if (uptimeTimer) clearInterval(uptimeTimer)
  uptimeTimer = reduceMotion.matches ? null : setInterval(tick, 1000)
}

function startClock(): void {
  const el = document.getElementById('pf-clock')
  if (!el) return
  const tick = (): void => {
    el.textContent = formatBogotaTime()
  }
  tick()
  if (clockTimer) clearInterval(clockTimer)
  clockTimer = reduceMotion.matches ? null : setInterval(tick, 30 * 1000)
}

function setStartedAt(): void {
  const el = document.getElementById('pf-started')
  if (!el) return
  el.textContent = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date())
}

export function initProfileSettings(): void {
  // Profile widgets always run, even when the panel is hidden - the data is
  // ready the moment the user clicks Profile in the activity bar.
  const startedAt = Date.now()
  startClock()
  setStartedAt()
  startUptime(startedAt)

  // React to a runtime reduced-motion toggle: re-arm (or stop) the ticking
  // timers. Each start* call renders one current value and re-checks the query.
  reduceMotion.addEventListener('change', () => {
    startClock()
    startUptime(startedAt)
  })

  // Settings bindings - restore from localStorage first, then attach.
  bindThemeButtons()
  bindFontSize()
  bindCursor()
  bindToggles()
  bindReset()
  restoreSettings()

  // Keypress sound effect: emit a faint chirp on real typing in any of the
  // editor / terminal / palette inputs. Only fires when `sound on`.
  document.addEventListener('keydown', (e) => {
    if (!soundOn) return
    const target = e.target as HTMLElement | null
    if (!target) return
    const tag = target.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) keypressBeep()
  })
}
