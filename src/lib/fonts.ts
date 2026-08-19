// The one self-hosted webfont, and it is a fallback.
//
// --font-sans in home/base.css puts `-apple-system` first, so macOS and iOS
// render in San Francisco and never fetch anything here. Inter is what Windows,
// Linux and Android get instead. next/font serves it from our own origin, so
// there is no render-blocking fonts.googleapis.com stylesheet and no
// cross-origin DNS + TLS handshake in front of first paint.
//
// preload is off deliberately. next/font preloads by default, which was right
// when Inter was the primary face and wrong now that it is the fallback: it put
// a blocking font fetch in front of every Apple visitor for a file they will
// never render. Without the hint the browser fetches it only if it is actually
// used for layout, which is exactly the condition we want.
//
// JetBrains Mono used to live here too, as the fallback for --font-mono and for
// the 404/500 console. `ui-monospace` and SF Mono cover Apple, Consolas and
// DejaVu Sans Mono cover everyone else, and none of those cost a download, so a
// whole second family was being preloaded to style a handful of terminal lines.
// Dev mode is unaffected: it loads JetBrains Mono itself from Google's CDN in
// app/(dev)/layout.tsx.
//
// Italic is deliberately absent: the site renders no italic anywhere. That
// reset is per-stylesheet, not global, so any page that does NOT import
// home/base.css must carry its own `i, em { font-style: normal }` or the
// browser will shear the roman into a fake oblique (see error-404.css and
// error-500.css, whose headlines wrap a digit in <i>).
import { Inter } from 'next/font/google'

// The opsz axis is what gives display-size text the Inter Display cut; browsers
// apply it automatically via font-optical-sizing. On Apple this is moot, since
// SF carries its own optical sizing.
export const inter = Inter({
  subsets: ['latin'],
  axes: ['opsz'],
  display: 'swap',
  preload: false,
  variable: '--font-inter',
})

export const siteFontClass = inter.variable
