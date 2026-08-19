import Script from 'next/script'
import type { Metadata } from 'next'
import '@/styles/error-404.css'

export const metadata: Metadata = {
  title: '404, page not found - Kevin Gámez',
  description: "The page could not be found on Kevin Gámez's site.",
  robots: 'noindex,nofollow',
}

export default function NotFound() {
  return (
    <div className="err404" lang="en">
      <div className="wrap">
        <div className="tag">route not found</div>
        <h1>
          4<i>0</i>4
        </h1>
        <p>This page doesn't exist. The URL may be mistyped or out of date.</p>
        <div className="ctas">
          <a className="btn btn-primary" href="/">
            ← Back home
          </a>
        </div>

        <div className="console" role="presentation">
          <div className="ln">
            <span className="nm">1</span>
            <span>
              <span className="key">$</span> resolve <span id="missing-path">/404</span>
            </span>
          </div>
          <div className="ln">
            <span className="nm">2</span>
            <span className="err">ERR_ROUTE_NOT_FOUND</span>
          </div>
          <div className="ln">
            <span className="nm">3</span>
            <span className="mute">
              fallbacks: <a href="/">/</a>, <a href="/dev/">/dev/</a>
            </span>
          </div>
          <div className="ln">
            <span className="nm">4</span>
            <span className="ok">hint: read /humans.txt for context</span>
          </div>
        </div>
      </div>

      <Script src="/error-page.js" strategy="afterInteractive" />
    </div>
  )
}
