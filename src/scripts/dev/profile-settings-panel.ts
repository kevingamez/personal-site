// Settings panel logic: keypress sound state, control bindings, reset, and localStorage restore.

import {
  LS_THEME,
  LS_FONTSIZE,
  LS_CURSOR,
  LS_MOTION,
  LS_SOUND,
  lsGet,
  lsSet,
  lsRemove,
} from './profile-settings-storage'
import {
  applyTheme,
  applyFontSize,
  applyCursor,
  applyMotion,
  type Theme,
  type Cursor,
} from './profile-settings-themes'

let soundCtx: AudioContext | null = null
export let soundOn = false

export function keypressBeep(): void {
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

export function bindThemeButtons(): void {
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

export function bindFontSize(): void {
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

export function bindCursor(): void {
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

export function bindToggles(): void {
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

export function bindReset(): void {
  const btn = document.getElementById('st-reset')
  if (!btn) return
  btn.addEventListener('click', () => {
    ;[LS_THEME, LS_FONTSIZE, LS_CURSOR, LS_MOTION, LS_SOUND].forEach((k) => lsRemove(k))
    location.reload()
  })
}

export function restoreSettings(): void {
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
