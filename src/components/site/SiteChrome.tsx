// Head plumbing that Next's metadata API does not cover, rendered at the top
// of <body>. React 19 hoists <link> and <meta> tags into <head>; the classic
// blocking <script> stays put, which is exactly right - it must run before any
// content below it paints (it gates the intro curtain), and nothing renders
// above it.

import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { CleanAnchors } from './CleanAnchors'
import { FaviconLife } from './FaviconLife'

// Inlined at build time rather than fetched. As `<script src>` this was a
// render-blocking request on every single page load: the parser stopped here
// until it came back, and /public ships with `max-age=0`, so even a repeat
// visitor paid a conditional round trip before anything below could paint. The
// file is ~2KB, which is cheaper embedded than requested. CSP already allows
// inline scripts (the App Router streams its RSC payload through them).
//
// public/head-init.js stays the source of truth so the behaviour is still
// readable as a normal file; this only changes how it is delivered.
const headInit = readFileSync(join(process.cwd(), 'public', 'head-init.js'), 'utf-8')

export function SiteChrome() {
  return (
    <>
      {/* Blocking on purpose: the intro-curtain gate must land before first
          paint. */}
      <script dangerouslySetInnerHTML={{ __html: headInit }} />

      {/* Icon links come from buildMetadata (src/lib/seo.ts). FaviconLife
          evolves the K favicon in the tab - it's a Game of Life seed. */}
      <FaviconLife />
      {/* Section links scroll without leaving #fragments in the URL. */}
      <CleanAnchors />

      <link rel="me" href="https://www.linkedin.com/in/kevin-gamez/" />
      <link rel="me" href="https://github.com/kevingamez" />
      <link rel="me" href="mailto:kevingamez.kg@gmail.com" />
    </>
  )
}
