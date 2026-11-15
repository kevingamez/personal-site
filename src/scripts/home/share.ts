// The share control.
//
// Share is progressive: navigator.share opens the OS sheet where it exists
// (every mobile browser, Safari on macOS), and everything else copies the URL
// to the clipboard and says so on the button itself. There is no third tier -
// a "share to X/LinkedIn" popup row is a different feature, and a wall of
// network logos is not what this page is.

import { track } from '../lib/analytics'

const TOAST_MS = 1900

type ShareMethod = 'native' | 'clipboard' | 'dismissed' | 'failed'

function shareData(btn: HTMLElement): ShareData {
  return {
    title: document.title,
    text: btn.dataset.shareText || document.title,
    url: location.href.split('#')[0],
  }
}

/** Swaps the label for a confirmation, then puts the original back. */
function toast(btn: HTMLElement, message: string): void {
  const label = btn.querySelector<HTMLElement>('[data-share-label]')
  // The icon-only button has no label node; it flashes the state class instead.
  if (label) {
    if (!label.dataset.original) label.dataset.original = label.textContent ?? ''
    label.textContent = message
  }
  btn.classList.add('is-shared')
  btn.setAttribute('data-toast', message)

  window.setTimeout(() => {
    if (label?.dataset.original) label.textContent = label.dataset.original
    btn.classList.remove('is-shared')
    btn.removeAttribute('data-toast')
  }, TOAST_MS)
}

async function copyLink(url: string): Promise<boolean> {
  try {
    // Only available on a secure origin. `?.` covers http://localhost:3000
    // being secure but an IP-address dev host not being.
    await navigator.clipboard?.writeText(url)
    return true
  } catch {
    return false
  }
}

async function onShare(btn: HTMLElement): Promise<void> {
  const data = shareData(btn)
  let method: ShareMethod

  if (typeof navigator.share === 'function') {
    try {
      await navigator.share(data)
      method = 'native'
    } catch (e) {
      // AbortError is the user closing the sheet. That is not a failure and it
      // must not fall through to the clipboard, which would silently do
      // something they just declined to do.
      if ((e as DOMException)?.name === 'AbortError') {
        track<{ name: 'share_click'; props: { method: ShareMethod } }>('share_click', {
          method: 'dismissed',
        })
        return
      }
      method = (await copyLink(data.url!)) ? 'clipboard' : 'failed'
    }
  } else {
    method = (await copyLink(data.url!)) ? 'clipboard' : 'failed'
  }

  if (method === 'clipboard') toast(btn, btn.dataset.shareCopied || 'Link copied')
  if (method === 'failed') toast(btn, btn.dataset.shareFailed || 'Copy failed')

  track<{ name: 'share_click'; props: { method: ShareMethod } }>('share_click', { method })
}

export function initShare(): void {
  for (const btn of document.querySelectorAll<HTMLElement>('[data-share]')) {
    btn.addEventListener('click', () => {
      void onShare(btn)
    })
  }

  // The contact button opens the mail app, and many desktops have none set
  // up. It also puts the address on the clipboard and says so, so the click
  // always ends with something in hand.
  for (const link of document.querySelectorAll<HTMLElement>('[data-copy-email]')) {
    link.addEventListener('click', () => {
      void copyLink(link.dataset.copyEmail || '').then((ok) => {
        if (ok) toast(link, link.dataset.shareCopied || 'Address copied')
      })
    })
  }

  for (const cta of document.querySelectorAll<HTMLElement>('[data-cta]')) {
    cta.addEventListener('click', () => {
      track<{ name: 'cta_click'; props: { id: string; href?: string } }>('cta_click', {
        id: cta.dataset.cta || 'unknown',
        href: cta.getAttribute('href') ?? undefined,
      })
    })
  }
}
