import type { NextConfig } from 'next'

// Security headers. Kept in sync with vercel.json (the repo convention is that
// both carry the same values; vercel.json applies at the edge, these apply
// whenever Next serves directly, e.g. `next start` and local dev).
//
// CSP note: App Router streams its RSC payload through inline <script> tags,
// so script-src needs 'unsafe-inline' here (Astro did not). Nonces would
// require per-request dynamic rendering, which this static site avoids.
//
// 'unsafe-eval' is added in development ONLY: React's dev build uses eval() to
// rebuild cross-environment callstacks, and without it the dev server throws
// "eval() is not supported in this environment". React never calls eval() in
// production, so the shipped policy stays strict and matches vercel.json.
const isDev = process.env.NODE_ENV === 'development'

const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://va.vercel-scripts.com`,
  "script-src-attr 'none'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://api.mapbox.com https://cdn.jsdelivr.net",
  "connect-src 'self' https://va.vercel-scripts.com https://vitals.vercel-insights.com",
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
    return [{ source: '/(.*)', headers: SECURITY_HEADERS }]
  },
}

export default nextConfig
