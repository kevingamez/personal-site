// Head plumbing that Next's metadata API does not cover, rendered at the top
// of <body>. React 19 hoists <link> and <meta> tags into <head>; the classic
// blocking <script> stays put, which is exactly right - it must run before any
// content below it paints (it gates the intro curtain), and nothing renders
// above it.

export function SiteChrome() {
  return (
    <>
      {/* Blocking on purpose: the intro-curtain gate must land before first
          paint, and the file is ~1KB. */}
      <script src="/head-init.js" />

      <link rel="me" href="https://co.linkedin.com/in/kevin-gamez/" />
      <link rel="me" href="https://github.com/kevingamez" />
      <link rel="me" href="mailto:kevingamez.kg@gmail.com" />

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Archivo:wght@300;400;500;600&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;600&display=swap"
      />
    </>
  )
}
