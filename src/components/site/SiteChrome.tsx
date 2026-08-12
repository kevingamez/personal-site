// Head plumbing that Next's metadata API does not cover, rendered at the top
// of <body>. React 19 hoists <link> and <meta> tags into <head>; the classic
// blocking <script> stays put, which is exactly right - it must run before any
// content below it paints (it gates the intro curtain), and nothing renders
// above it.

import { CleanAnchors } from './CleanAnchors'
import { FaviconLife } from './FaviconLife'

export function SiteChrome() {
  return (
    <>
      {/* Blocking on purpose: the intro-curtain gate must land before first
          paint, and the file is ~1KB. */}
      <script src="/head-init.js" />

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
