import { defineMiddleware } from 'astro:middleware'

export const onRequest = defineMiddleware((_context, next) => {
  const response = next()

  return response.then((res) => {
    res.headers.set('X-Frame-Options', 'DENY')
    res.headers.set('X-Content-Type-Options', 'nosniff')
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
    res.headers.set(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
        "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
        "font-src 'self' https://cdn.jsdelivr.net",
        "img-src 'self' data: https:",
        "connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com",
        "frame-ancestors 'none'",
      ].join('; ')
    )
    return res
  })
})
