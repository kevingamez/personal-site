import type { ReactNode } from 'react'
import type { Viewport } from 'next'
import { SiteChrome } from '@/components/site/SiteChrome'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f4f4f2',
  colorScheme: 'light',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // head-init.js stamps `intro-pending` on <html> before React hydrates -
    // an expected, deliberate mismatch.
    <html lang="es" suppressHydrationWarning>
      <body>
        <SiteChrome />
        {children}
      </body>
    </html>
  )
}
