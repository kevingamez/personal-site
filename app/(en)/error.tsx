'use client'

// The error BOUNDARY, which is a different thing from the /500 route next to
// it. /500 is a page you can navigate to; this is what React renders when a
// segment actually throws while rendering. Without it, a runtime error in
// production shows Next's own fallback, which reads "Application error: a
// client-side exception has occurred" on a blank page.
//
// Client component by requirement: error boundaries need state, and `reset` is
// a function React hands us. It re-renders the failed segment in place, which
// recovers from a transient failure without a full document load.

import { useEffect } from 'react'
import '@/styles/error-500.css'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Vercel captures this from the function logs, and `digest` is the id that
    // ties the pretty page a visitor saw to the stack trace we can read.
    console.error('[render error]', error.digest ?? '(no digest)', error)
  }, [error])

  return (
    <div className="err500" lang="en">
      <div className="wrap">
        <div className="tag">Something broke</div>
        <h1>
          5<i>0</i>0
        </h1>
        <h2>That did not render.</h2>
        <p>
          The rest of the site is fine. Trying again usually works, since most of these are a
          request that timed out rather than a page that is broken for good.
        </p>
        <div className="ctas">
          <button className="btn btn-primary" type="button" onClick={reset}>
            ↻ Try again
          </button>
          <a className="btn btn-ghost" href="/">
            ← Back home
          </a>
          <a className="btn btn-ghost" href="mailto:kevingamez.kg@gmail.com">
            Tell me about it
          </a>
        </div>

        <div className="console" role="presentation">
          <div className="ln">
            <span className="nm">1</span>
            <span>
              <span className="key">$</span> <span className="mute">render segment</span>
            </span>
          </div>
          <div className="ln">
            <span className="nm">2</span>
            <span className="err">Error: the component threw while rendering</span>
          </div>
          <div className="ln">
            <span className="nm">3</span>
            <span className="mute">
              digest: {error.digest ?? 'none, this one threw on the client'}
            </span>
          </div>
          <div className="ln">
            <span className="nm">4</span>
            <span className="ok">retry re-renders this section only, the page stays put</span>
          </div>
        </div>
      </div>
    </div>
  )
}
