import { defineMiddleware } from 'astro:middleware'

// Static deploys ignore this file. The canonical security headers live in
// `vercel.json` and are applied at the edge. This middleware is kept as a
// fallback for if/when an SSR adapter is wired up.
export const onRequest = defineMiddleware(async (_context, next) => {
  const res = await next()

  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  res.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://www.google.com https://tiles.openfreemap.org https://elevation-tiles-prod.s3.amazonaws.com",
      "worker-src 'self' blob:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  )

  return res
})
