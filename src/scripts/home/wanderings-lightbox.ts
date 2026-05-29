// Travel-photo lightbox for the wanderings map. An aria-modal dialog with
// focus management. Extracted from wanderings.ts to keep it under 300 lines.

import type { TravelPoint } from './wanderings'

interface Lightbox {
  open: (p: TravelPoint) => void
  close: () => void
}

let lightboxSingleton: Lightbox | null = null

export function ensureLightbox(): Lightbox {
  if (lightboxSingleton) return lightboxSingleton
  const root = document.createElement('div')
  root.className = 'wp-lightbox'
  root.setAttribute('role', 'dialog')
  root.setAttribute('aria-modal', 'true')
  root.setAttribute('aria-label', 'Travel photo')
  root.innerHTML = `
    <div class="wp-lb-backdrop" data-close></div>
    <button class="wp-lb-close" type="button" aria-label="Close" data-close>×</button>
    <figure class="wp-lb-figure">
      <img class="wp-lb-img" alt="" />
      <figcaption class="wp-lb-caption">
        <span class="wp-lb-city"></span>
        <span class="wp-lb-country"></span>
      </figcaption>
    </figure>
  `
  document.body.appendChild(root)

  const img = root.querySelector<HTMLImageElement>('.wp-lb-img')!
  const cityEl = root.querySelector<HTMLElement>('.wp-lb-city')!
  const countryEl = root.querySelector<HTMLElement>('.wp-lb-country')!
  const closeBtn = root.querySelector<HTMLButtonElement>('.wp-lb-close')!

  // Remember what had focus so we can restore it when the modal closes.
  let lastFocused: HTMLElement | null = null

  const close = (): void => {
    root.classList.remove('on')
    document.body.classList.remove('wp-lock')
    if (lastFocused) {
      lastFocused.focus()
      lastFocused = null
    }
  }
  const open = (p: TravelPoint): void => {
    if (!p.photo) return
    img.src = p.photo
    img.alt = p.photoAlt || `${p.city}, ${p.country}`
    cityEl.textContent = p.city
    countryEl.textContent = p.country
    lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    root.classList.add('on')
    document.body.classList.add('wp-lock')
    closeBtn.focus()
  }
  root.addEventListener('click', (e) => {
    const t = e.target as HTMLElement
    if (t.dataset.close !== undefined) close()
  })
  // This is an aria-modal dialog, so manage focus: Escape closes, and Tab is
  // trapped on the only focusable control (the close button) instead of leaking
  // into the inert page behind it.
  document.addEventListener('keydown', (e) => {
    if (!root.classList.contains('on')) return
    if (e.key === 'Escape') {
      close()
    } else if (e.key === 'Tab') {
      e.preventDefault()
      closeBtn.focus()
    }
  })

  lightboxSingleton = { open, close }
  return lightboxSingleton
}
