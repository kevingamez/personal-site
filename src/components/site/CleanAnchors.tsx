'use client'

import { useEffect } from 'react'

// In-page anchors (#about, #contact, ...) scroll to their section without
// leaving the fragment in the address bar. Scroll smoothness is CSS-owned
// (html { scroll-behavior } in base.css already honors reduced motion), so
// scrollIntoView inherits the right behavior.
export function CleanAnchors() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)
        return
      const el = e.target instanceof Element ? e.target.closest('a[href^="#"]') : null
      if (!(el instanceof HTMLAnchorElement)) return
      const id = el.getAttribute('href')?.slice(1)
      if (!id) return
      const target = document.getElementById(id)
      if (!target) return
      e.preventDefault()
      target.focus({ preventScroll: true })
      target.scrollIntoView()
      history.replaceState(history.state, '', location.pathname + location.search)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return null
}
