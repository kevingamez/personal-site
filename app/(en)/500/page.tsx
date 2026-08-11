import type { Metadata } from 'next'
import '@/styles/error-500.css'

export const metadata: Metadata = {
  title: '500 - Kevin Gámez',
  robots: 'noindex,nofollow',
}

export default function ErrorPage() {
  return (
    <div className="err500">
      <div className="wrap">
        <div className="tag">Server error</div>
        <h1>
          5<i>0</i>0
        </h1>
        <h2>Something went wrong.</h2>
        <p>Something broke while rendering this page. Try refreshing, or go back home.</p>
        <div className="ctas">
          <a className="btn btn-primary" href="/">
            ← Back home
          </a>
          <button className="btn btn-ghost" type="button" id="refresh-btn">
            ↻ Refresh
          </button>
          <a className="btn btn-ghost" href="/dev/">
            Open dev mode
          </a>
        </div>

        <div className="console" role="presentation">
          <div className="ln">
            <span className="nm">1</span>
            <span>
              <span className="key">$</span> <span className="mute">curl -i kevingamez.co</span>
            </span>
          </div>
          <div className="ln">
            <span className="nm">2</span>
            <span className="err">HTTP/1.1 500 Internal Server Error</span>
          </div>
          <div className="ln">
            <span className="nm">3</span>
            <span className="mute">x-build: static · vercel</span>
          </div>
        </div>
      </div>

      <script src="/head-init.js" defer></script>
      <script src="/error-page.js" defer></script>
    </div>
  )
}
