import type { NextConfig } from 'next'

// Security headers. Kept in sync with vercel.json (the repo convention is that
// both carry the same values; vercel.json applies at the edge, these apply
// whenever Next serves directly, e.g. `next start` and local dev).
//
// CSP note: App Router streams its RSC payload through inline <script> tags,
// so script-src needs 'unsafe-inline' here (Astro did not). Nonces would
// require per-request dynamic rendering, which this static site avoids.
//
// GA4 (gtag.js) is served from googletagmanager.com and beacons to
// google-analytics.com, hence those hosts in script-src / img-src / connect-src.
// It only ever loads when NEXT_PUBLIC_GA_ID is set; the hosts are harmless
// otherwise. Keep this list identical to the one in vercel.json.
//
// 'unsafe-eval' is added in development ONLY: React's dev build uses eval() to
// rebuild cross-environment callstacks, and without it the dev server throws
// "eval() is not supported in this environment". React never calls eval() in
// production, so the shipped policy stays strict and matches vercel.json.
const isDev = process.env.NODE_ENV === 'development'

const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://va.vercel-scripts.com https://www.googletagmanager.com`,
  "script-src-attr 'none'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://api.mapbox.com https://cdn.jsdelivr.net https://www.googletagmanager.com https://www.google-analytics.com",
  "connect-src 'self' https://va.vercel-scripts.com https://vitals.vercel-insights.com https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://www.googletagmanager.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

const SECURITY_HEADERS = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value:
      'camera=(), microphone=(), geolocation=(), payment=(), usb=(), accelerometer=(), gyroscope=(), magnetometer=(), browsing-topics=()',
  },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'Content-Security-Policy', value: CSP },
]

const nextConfig: NextConfig = {
  // The Astro site used trailing slashes (/es/, /dev/); preserve every URL.
  trailingSlash: true,
  poweredByHeader: false,
  // /api/repo serves dev mode's source viewer. It walks the project to build
  // the allowlist of paths it will serve, and reads a file off disk when
  // GitHub is unreachable or does not have the deployed commit. Neither works
  // unless the source ships with the function: a Next lambda carries compiled
  // output, not the original tree, so without this the allowlist comes back
  // empty in production and every file 404s while working perfectly in dev.
  outputFileTracingIncludes: {
    '/api/repo': [
      './app/**/*.{ts,tsx}',
      './src/**/*.{ts,tsx,css}',
      './*.{ts,json,md}',
      './.{editorconfig,gitignore,prettierignore}',
    ],
  },
  async headers() {
    return [
      { source: '/(.*)', headers: SECURITY_HEADERS },
      // Everything Next emits under /_next/static already gets immutable
      // caching from its content hash, but /public does not: it ships with
      // `max-age=0, must-revalidate`, so every logo, favicon and photo costs a
      // conditional request on every repeat visit. These filenames are stable
      // and their content only changes with a deploy, so a day of freshness
      // with a week of stale-while-revalidate keeps repeat loads off the
      // network without pinning a wrong asset for long.
      //
      // Deliberately NOT immutable, and deliberately scoped to media: text
      // files that are meant to be re-read (robots.txt, security.txt,
      // humans.txt) and head-init.js, which gates the intro before paint,
      // must stay revalidated so a deploy takes effect immediately.
      {
        source: '/:path*.:ext(png|jpg|jpeg|webp|avif|gif|svg|ico|woff|woff2)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
      // Personal photographs: they carry Kevin's face, his family and his
      // friends, and they exist to be seen in context on this page, not as
      // standalone results in Google Images. `noindex` on the file keeps the
      // pages that show them fully indexable; it only removes the images
      // themselves. Scoped to /posts because that is the whole photo set (the
      // deck's .webp and the writing feed's .jpg are the same nine pictures),
      // and it deliberately excludes the OG card and the logos.
      {
        source: '/posts/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex' }],
      },
      // Pagination prefix. No route serves /page/ today; this is the standing
      // guard so that if one is ever added, the numbered listing pages cannot
      // enter the index as thin duplicates of the section they paginate.
      // Crawling is deliberately left open in robots.txt - a Disallow there
      // would stop the crawler fetching the URL, and it would never read this
      // header.
      {
        source: '/page/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, follow' }],
      },
    ]
  },
}

export default nextConfig
