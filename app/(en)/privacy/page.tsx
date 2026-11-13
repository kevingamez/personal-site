import type { Metadata } from 'next'
import { en } from '@/content/home-en'
import { buildMetadata } from '@/lib/seo'
import '@/styles/home/index.css'
import '@/styles/privacy.css'

const meta = {
  ...en.meta,
  title: 'Privacy, Kevin Gámez',
  ogTitle: 'Privacy, Kevin Gámez',
  twitterTitle: 'Privacy, Kevin Gámez',
  description:
    'What kevingamez.co collects, why, and how to opt out. First-party analytics, error logs.',
  ogDescription:
    'What kevingamez.co collects, why, and how to opt out. First-party analytics, error logs.',
  twitterDescription:
    'What kevingamez.co collects, why, and how to opt out. First-party analytics, error logs.',
  canonical: 'https://kevingamez.co/privacy/',
  ogUrl: 'https://kevingamez.co/privacy/',
  // A policy page is not a profile card: og:type website, no profile:* trio.
  ogType: 'website' as const,
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
            Plain-language list of every piece of data <a href="/">kevingamez.co</a> sees, why, and
            how to opt out. Last updated 2026-11.
          </p>
        </header>

        <h2>The short version</h2>
        <ul>
          <li>No accounts, no logins, no marketing emails.</li>
          <li>
            Aggregate analytics - page views, sections viewed, device, country - never tied to you.
          </li>
          <li>
            One functional cookie, and only if you use the language switch. No session replays, and
            nothing in this site&apos;s code fingerprints you.
          </li>
          <li>
            The <code>/api/chat</code> Claude console uses your IP only as a rate-limit key (20
            messages / IP / day). The key expires when the daily window ends.
          </li>
          <li>Nothing is sold or shared with third parties beyond the vendors below.</li>
        </ul>

        <h2>Vendors and what they receive</h2>

        <h3>Vercel (hosting)</h3>
        <p>
          Vercel serves every page and runs the <code>/api/*</code> routes, so like any host it sees
          your IP address and request headers. How long Vercel keeps its request logs is governed by
          Vercel. Server errors from the routes below are written to those logs. The Strava section
          calls <code>/api/geo</code>, which reads the country Vercel derives from your IP and
          returns it to your browser to choose kilometers or miles. That answer is never cached or
          stored.
        </p>

        <h3>Vercel Analytics + Speed Insights</h3>
        <p>
          First-party, cookieless. Records page paths, custom event names (e.g.{' '}
          <code>section_view</code>, <code>cta_click</code>), Core Web Vitals (LCP, INP, CLS) and
          country at country level. No persistent identifier. On <code>/dev</code> it also records
          which file you open and the name of each known terminal command you run. Anything else you
          type there is recorded only as <code>unknown</code>.
        </p>

        <h3>Google Analytics 4</h3>
        <p>
          Runs only when a measurement ID is configured, and runs in cookieless mode:{' '}
          <code>client_storage: &apos;none&apos;</code> stops it writing the usual <code>_ga</code>{' '}
          identifiers, and GA4 does not log or store IP addresses. It receives the same event names
          as the list above, plus your page path, referrer, approximate country and device type.
          Because there is no persistent ID, a return visit is counted as a new one.
        </p>

        <h3>Upstash (rate limiting)</h3>
        <p>
          Rate-limit counters live in an Upstash Redis database, keyed by your IP address as Vercel
          reports it. It is not hashed. The console&apos;s key expires after its one-day window. The
          other routes (<code>/api/strava</code>, <code>/api/geo</code>, <code>/api/weather</code>,{' '}
          <code>/api/repo</code>) use 10-minute windows, and their keys expire within about 20
          minutes. Only the counter is stored, never what you asked.
        </p>

        <h3>Anthropic (Claude, /api/chat)</h3>
        <p>
          When you use the live console, up to the last 8 messages of that session&apos;s
          conversation, your new one included, are sent to Anthropic&apos;s API to generate a reply.
          Your IP is not sent to Anthropic. The assistant can run a web search through
          Anthropic&apos;s hosted search tool, which sends a query written from your question.
          Conversations are not stored by this site: the history lives only in your open tab and is
          gone on reload. How long Anthropic keeps API inputs is governed by Anthropic&apos;s own
          policy.
        </p>

        <h3>Mapbox</h3>
        <p>
          The route maps in the Strava section are static images your browser loads directly from{' '}
          <code>api.mapbox.com</code>, so Mapbox receives your IP address and browser details with
          each image. The routes drawn are Kevin&apos;s, not yours. Retention is governed by Mapbox.
        </p>

        <h3>Strava and Open-Meteo</h3>
        <p>
          The server fetches Kevin&apos;s own activities from Strava and Bogotá&apos;s weather from
          Open-Meteo. Your browser only talks to this site for both, and nothing about you is sent
          upstream.
        </p>

        <h3>Fonts and icons</h3>
        <p>
          The main site&apos;s fonts are self-hosted, so no font request leaves this domain. The{' '}
          <code>/dev</code> page loads its fonts from Google Fonts (
          <code>fonts.googleapis.com</code>, <code>fonts.gstatic.com</code>) and its file icons from{' '}
          <code>cdn.jsdelivr.net</code>, so those providers receive your IP address when you open
          it.
        </p>

        <h2>How to opt out</h2>
        <ul>
          <li>
            <strong>Block analytics.</strong> Browser tracker-blockers such as uBlock Origin
            commonly block Vercel Analytics and Google Analytics. The site still works fully.
          </li>
          <li>
            <strong>Don&apos;t use the console.</strong> If you don&apos;t type in{' '}
            <code>/#console</code> or click one of its suggestions, nothing reaches Anthropic.
            Browsing the rest of the site doesn&apos;t trigger any LLM call.
          </li>
          <li>
            <strong>Questions.</strong> Email{' '}
            <a href="mailto:kevingamez.kg@gmail.com">kevingamez.kg@gmail.com</a> about anything on
            this page.
          </li>
        </ul>

        <h2>Cookies and browser storage</h2>
        <p>
          One cookie, <code>lang</code>, set only when you use the language switch. It holds{' '}
          <code>en</code> or <code>es</code> so the home page opens in the language you picked, and
          lasts a year. Both analytics vendors run cookieless, and there are no advertising or
          remarketing pixels.
        </p>
        <p>
          The home page sets a <code>kg-intro</code> flag in session storage so the intro only plays
          once per tab. On <code>/dev</code>, your scratchpad, edited files and settings are kept in
          your browser&apos;s local storage. None of it is sent anywhere, and clearing site data
          removes it.
        </p>

        <h2>Contact</h2>
        <p>
          Questions or a deletion request:{' '}
          <a href="mailto:kevingamez.kg@gmail.com">kevingamez.kg@gmail.com</a>.
        </p>

        <p className="back">
          <a href="/">← Back to home</a>
        </p>
      </article>
    </main>
  )
}
