// Profile panel widgets (live Bogotá clock, session uptime, started-at) and
// the Settings panel (theme switcher, font size, cursor style, motion + sound
// toggles). All preferences persist to localStorage under `dev:*` keys.

import { formatBogotaTime } from '@/scripts/clock'

const LS_THEME = 'dev:theme'
const LS_FONTSIZE = 'dev:fontsize'
const LS_CURSOR = 'dev:cursor'
const LS_MOTION = 'dev:motion'
const LS_SOUND = 'dev:sound'

// localStorage can throw (Safari private mode, locked-down webviews). Guard
// every access so a SecurityError can't abort initProfileSettings() and leave
// /dev half-wired (shortcuts unbound, README never opened).
const lsGet = (key: string): string | null => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
const lsSet = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* storage blocked - ignore */
  }
}
const lsRemove = (key: string): void => {
  try {
    localStorage.removeItem(key)
  } catch {
    /* storage blocked - ignore */
  }
}

type Theme = 'cream' | 'midnight' | 'sepia' | 'solar'
type Cursor = 'block' | 'bar' | 'underline'

const THEME_VARS: Record<Theme, Record<string, string>> = {
  cream: {
    // Default - the cream/coral editorial palette.
    '--bg': '#0a0a0d',
    '--panel': '#10101a',
    '--panel-2': '#16161e',
    '--line': '#22222c',
    '--line-2': '#2a2a36',
    '--ink': '#e8e8ec',
    '--ink-2': '#c9c9d1',
    '--mute': '#7d7d88',
    '--mute-2': '#555560',
    '--coral': '#d96944',
    '--coral-soft': '#3a201a',
    '--green': '#3fb950',
    '--yellow': '#d29922',
    '--red': '#f85149',
    '--blue': '#7a98c4',
    '--purple': '#c47ad9',
    '--string': '#a5d6ff',
  },
  midnight: {
    '--bg': '#05060f',
    '--panel': '#0a0d1f',
    '--panel-2': '#101430',
    '--line': '#1a2148',
    '--line-2': '#243064',
    '--ink': '#e6ecff',
    '--ink-2': '#c2cff5',
    '--mute': '#7a86b8',
    '--mute-2': '#525c80',
    '--coral': '#6b8eff',
    '--coral-soft': '#1a2148',
    '--green': '#5be59f',
    '--yellow': '#ffd166',
    '--red': '#ff5d6c',
    '--blue': '#7a98c4',
    '--purple': '#b675ff',
    '--string': '#a5d6ff',
  },
  sepia: {
    '--bg': '#1a140e',
    '--panel': '#221a12',
    '--panel-2': '#2c2218',
    '--line': '#3a2c1f',
    '--line-2': '#4a3a2a',
    '--ink': '#f3e4cb',
    '--ink-2': '#d8c4a4',
    '--mute': '#a08770',
    '--mute-2': '#6e5a44',
    '--coral': '#d99454',
    '--coral-soft': '#3a2418',
    '--green': '#a8c068',
    '--yellow': '#e3b34a',
    '--red': '#d96b48',
    '--blue': '#8aa8a0',
    '--purple': '#b89380',
    '--string': '#d8b888',
  },
  solar: {
    '--bg': '#0c0a05',
    '--panel': '#171108',
    '--panel-2': '#1f180a',
    '--line': '#2e2310',
    '--line-2': '#473518',
    '--ink': '#fff4d9',
    '--ink-2': '#f0d8a0',
    '--mute': '#b89060',
    '--mute-2': '#6e5530',
    '--coral': '#ffb066',
    '--coral-soft': '#3a2418',
    '--green': '#7dc068',
    '--yellow': '#ffd54f',
    '--red': '#d9483a',
    '--blue': '#88b8d4',
    '--purple': '#d97a93',
    '--string': '#f0e29a',
  },
}

function applyTheme(name: Theme): void {
  const vars = THEME_VARS[name]
  if (!vars) return
  const root = document.documentElement
  for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v)
  root.dataset.theme = name
}

function applyFontSize(px: number): void {
  document.documentElement.style.setProperty('--editor-font-size', `${px}px`)
  // CodeMirror sets its own font-size inline via the theme, so we also push
  // a sized style on the .cm-editor + .cm-content + gutters to override it.
  const sel = '.cm-editor, .cm-editor .cm-scroller, .cm-content, .cm-gutters'
  document.querySelectorAll<HTMLElement>(sel).forEach((el) => {
    el.style.fontSize = `${px}px`
  })
}

function applyCursor(style: Cursor): void {
  document.documentElement.dataset.cursor = style
}

function applyMotion(reduce: boolean): void {
  document.documentElement.dataset.motion = reduce ? 'reduce' : 'full'
}

let soundCtx: AudioContext | null = null
let soundOn = false

function keypressBeep(): void {
  if (!soundOn) return
  try {
    if (!soundCtx) {
      type WindowAudio = Window & { webkitAudioContext?: typeof AudioContext }
      const Ctx = window.AudioContext || (window as WindowAudio).webkitAudioContext
      if (!Ctx) return
      soundCtx = new Ctx()
    }
    const o = soundCtx.createOscillator()
    const g = soundCtx.createGain()
    o.frequency.value = 600 + Math.random() * 200
    o.type = 'square'
    g.gain.value = 0.015
    o.connect(g).connect(soundCtx.destination)
    o.start()
    o.stop(soundCtx.currentTime + 0.04)
  } catch {
    /* ignore audio failures */
  }
}

function bindThemeButtons(): void {
  const buttons = document.querySelectorAll<HTMLButtonElement>('.st-theme[data-theme]')
  buttons.forEach((b) =>
    b.addEventListener('click', () => {
      const theme = b.dataset.theme as Theme | undefined
      if (!theme) return
      applyTheme(theme)
      buttons.forEach((x) => {
        x.classList.toggle('on', x === b)
        x.setAttribute('aria-checked', String(x === b))
      })
      lsSet(LS_THEME, theme)
    })
  )
}

function bindFontSize(): void {
  const slider = document.getElementById('st-fontsize') as HTMLInputElement | null
  const out = document.getElementById('st-fontsize-out')
  if (!slider) return
  const sync = (): void => {
    const px = parseFloat(slider.value)
    applyFontSize(px)
    if (out) out.textContent = `${px}px`
    lsSet(LS_FONTSIZE, slider.value)
  }
  slider.addEventListener('input', sync)
  sync()
}

function bindCursor(): void {
  const buttons = document.querySelectorAll<HTMLButtonElement>('.st-seg[data-cursor]')
  buttons.forEach((b) =>
    b.addEventListener('click', () => {
      const c = b.dataset.cursor as Cursor | undefined
      if (!c) return
      applyCursor(c)
      buttons.forEach((x) => {
        x.classList.toggle('on', x === b)
        x.setAttribute('aria-checked', String(x === b))
      })
      lsSet(LS_CURSOR, c)
    })
  )
}

function bindToggles(): void {
  const motion = document.getElementById('st-motion') as HTMLInputElement | null
  const sound = document.getElementById('st-sound') as HTMLInputElement | null
  if (motion) {
    motion.addEventListener('change', () => {
      applyMotion(motion.checked)
      lsSet(LS_MOTION, motion.checked ? '1' : '0')
    })
  }
  if (sound) {
    sound.addEventListener('change', () => {
      soundOn = sound.checked
      lsSet(LS_SOUND, sound.checked ? '1' : '0')
    })
  }
}

function bindReset(): void {
  const btn = document.getElementById('st-reset')
  if (!btn) return
  btn.addEventListener('click', () => {
    ;[LS_THEME, LS_FONTSIZE, LS_CURSOR, LS_MOTION, LS_SOUND].forEach((k) => lsRemove(k))
    location.reload()
  })
}

function restoreSettings(): void {
  const theme = (lsGet(LS_THEME) as Theme | null) || 'cream'
  applyTheme(theme)
  const themeBtn = document.querySelector<HTMLButtonElement>(`.st-theme[data-theme="${theme}"]`)
  if (themeBtn) {
    document.querySelectorAll('.st-theme').forEach((x) => {
      x.classList.toggle('on', x === themeBtn)
      x.setAttribute('aria-checked', String(x === themeBtn))
    })
  }

  const fontVal = lsGet(LS_FONTSIZE)
  const slider = document.getElementById('st-fontsize') as HTMLInputElement | null
  if (fontVal && slider) {
    slider.value = fontVal
    applyFontSize(parseFloat(fontVal))
    const out = document.getElementById('st-fontsize-out')
    if (out) out.textContent = `${fontVal}px`
  }

  const cursor = (lsGet(LS_CURSOR) as Cursor | null) || 'block'
  applyCursor(cursor)
  const curBtn = document.querySelector<HTMLButtonElement>(`.st-seg[data-cursor="${cursor}"]`)
  if (curBtn) {
    document.querySelectorAll('.st-seg').forEach((x) => {
      x.classList.toggle('on', x === curBtn)
      x.setAttribute('aria-checked', String(x === curBtn))
    })
  }

  const motionEl = document.getElementById('st-motion') as HTMLInputElement | null
  const motionOn = lsGet(LS_MOTION) === '1'
  if (motionEl) motionEl.checked = motionOn
  applyMotion(motionOn)

  const soundEl = document.getElementById('st-sound') as HTMLInputElement | null
  soundOn = lsGet(LS_SOUND) === '1'
  if (soundEl) soundEl.checked = soundOn
}

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
