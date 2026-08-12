// Self-hosted webfonts. next/font downloads these at build time and serves them
// from our own origin, so there is no render-blocking fonts.googleapis.com
// stylesheet and no cross-origin DNS + TLS handshake in front of first paint.
//
// Italic is deliberately absent: the site renders no italic anywhere. That
// reset is per-stylesheet, not global, so any page that does NOT import
// home/base.css must carry its own `i, em { font-style: normal }` or the
// browser will shear the roman into a fake oblique (see error-404.css and
// error-500.css, whose headlines wrap a digit in <i>).
import { Inter, JetBrains_Mono } from 'next/font/google'

// The opsz axis is what gives display-size text the Inter Display cut; browsers
// apply it automatically via font-optical-sizing.
export const inter = Inter({
  subsets: ['latin'],
  axes: ['opsz'],
  display: 'swap',
  variable: '--font-inter',
})

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
})

export const siteFontClass = `${inter.variable} ${jetbrainsMono.variable}`
