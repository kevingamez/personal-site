'use client'

// Last resort. The per-group error.tsx files render INSIDE their layout, so
// they cannot catch a throw that happens in the layout itself: at that point
// there is no <html> for them to render into. This one replaces the whole
// document, which is why it declares its own <html> and <body>.
//
// It has no nav, no footer and no site chrome on purpose. If the root layout
// is what failed, anything it provides is exactly what we cannot trust.

import { useEffect } from 'react'
import { siteFontClass } from '@/lib/fonts'
import '@/styles/error-500.css'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[root layout error]', error.digest ?? '(no digest)', error)
  }, [error])

  return (
    <html lang="en" className={siteFontClass}>
      <body>
        <div className="err500">
          <div className="wrap">
            <div className="tag">Site error</div>
            <h1>
              5<i>0</i>0
            </h1>
            <h2>The page could not be assembled.</h2>
            <p>
              This one failed before the layout existed, so there is no navigation to offer you.
              Reloading is the honest next step.
            </p>
            <div className="ctas">
              <button className="btn btn-primary" type="button" onClick={reset}>
                ↻ Reload
              </button>
              <a className="btn btn-ghost" href="mailto:kevingamez.kg@gmail.com">
                Tell me about it
              </a>
            </div>

            <div className="console" role="presentation">
              <div className="ln">
                <span className="nm">1</span>
                <span>
                  <span className="key">$</span> <span className="mute">render root layout</span>
                </span>
              </div>
              <div className="ln">
                <span className="nm">2</span>
                <span className="err">Error: threw above every boundary</span>
              </div>
              <div className="ln">
                <span className="nm">3</span>
                <span className="mute">digest: {error.digest ?? 'none'}</span>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
