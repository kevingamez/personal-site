import type { Metadata } from 'next'
import { en } from '@/content/home-en'
import { buildMetadata } from '@/lib/seo'
import '@/styles/home/index.css'
import '@/styles/privacy.css'

const meta = {
  ...en.meta,
  title: 'Privacy · Kevin Gámez',
  ogTitle: 'Privacy · Kevin Gámez',
  twitterTitle: 'Privacy · Kevin Gámez',
  description: 'What kevingamez.co collects, why, and how to opt out. First-party analytics, error logs.',
  ogDescription: 'What kevingamez.co collects, why, and how to opt out. First-party analytics, error logs.',
  twitterDescription: 'What kevingamez.co collects, why, and how to opt out. First-party analytics, error logs.',
  canonical: 'https://kevingamez.co/privacy/',
  ogUrl: 'https://kevingamez.co/privacy/',
  includeJsonLd: false,
  // Standalone, English-only page: don't advertise a Spanish alternate (there
  // isn't one) or point hreflang at the homepage.
  hreflang: [],
}

export const metadata: Metadata = buildMetadata(meta)

export default function Page() {
  return (
    <main className="privacy-page">
      <article className="wrap privacy-article">
        <header>
          <p className="kicker">Privacy</p>
          <h1>What this site collects</h1>
          <p className="lede">
            Plain-language list of every piece of data <a href="/">kevingamez.co</a> sees, why, and how to opt out. Last updated
            2026-08.
          </p>
        </header>

        <h2>The short version</h2>
        <ul>
          <li>No accounts, no logins, no marketing emails.</li>
          <li>Aggregate analytics - page views, sections viewed, device, country - never tied to you.</li>
          <li>No cookies, no session replays, no fingerprinting.</li>
          <li>
            The <code>/api/chat</code> Claude console keeps your IP only for daily rate limiting (20 messages / IP / day) and
            forgets it within 24 hours.
          </li>
          <li>Nothing is sold or shared with third parties beyond the vendors below.</li>
        </ul>

        <h2>Vendors and what they receive</h2>

        <h3>Vercel Analytics + Speed Insights</h3>
        <p>
          First-party, cookieless. Records page paths, custom event names (e.g. <code>section_view</code>,{' '}
          <code>cta_click</code>), Core Web Vitals (LCP, INP, CLS) and country at country level. No persistent identifier.
        </p>

        <h3>Anthropic (Claude · /api/chat)</h3>
        <p>
          When you use the live console, your message and the conversation history of that session are sent to Anthropic's
          API to generate a reply. Your IP is hashed in memory at the Vercel edge for rate-limiting and discarded at the
          end of each day. Conversations are not stored on the server.
        </p>

        <h2>How to opt out</h2>
        <ul>
          <li>
            <strong>Block analytics.</strong> Most browser tracker-blockers (uBlock Origin, Brave Shields, Privacy Badger, Safari
            ITP) already block Vercel Analytics by default. The site still works fully.
          </li>
          <li>
            <strong>Don't use the console.</strong> If you don't type anything in <code>/#console</code>, nothing reaches
            Anthropic. Browsing the rest of the site doesn't trigger any LLM call.
          </li>
          <li>
            <strong>Questions.</strong> Email <a href="mailto:kevingamez.kg@gmail.com">kevingamez.kg@gmail.com</a> about anything
            on this page.
          </li>
        </ul>

        <h2>Cookies</h2>
        <p>
          None. This site sets no cookies - analytics are cookieless, and there are no advertising or remarketing pixels.
        </p>

        <h2>Contact</h2>
        <p>
          Questions or a deletion request: <a href="mailto:kevingamez.kg@gmail.com">kevingamez.kg@gmail.com</a>.
        </p>

        <p className="back"><a href="/">← Back to home</a></p>
      </article>
    </main>
  )
}
