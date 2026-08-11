'use client'

// Loads the vanilla home-page scripts after hydration. The scripts are the
// same modules the Astro site shipped - they find their elements by id/class,
// so they only need the DOM to exist, which useEffect guarantees.

import { useEffect } from 'react'

export function HomeScripts(): null {
  useEffect(() => {
    void import('@/scripts/home/index')
  }, [])
  return null
}
