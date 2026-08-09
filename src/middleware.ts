import { defineMiddleware } from 'astro:middleware'

// Static deploys ignore this file. The canonical security headers live in
// `vercel.json` and are applied at the edge. This middleware is kept as a
// fallback for if/when an SSR adapter is wired up.
export const onRequest = defineMiddleware(async (_context, next) => {
  const res = await next()

  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), accelerometer=(), gyroscope=(), magnetometer=(), browsing-topics=()'
  )
  res.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  res.headers.set('Cross-Origin-Resource-Policy', 'same-origin')
  res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  res.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' https://va.vercel-scripts.com",
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
  )

  return res
})
