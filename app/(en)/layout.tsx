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
    <html lang="en">
      <body>
        <SiteChrome />
        {children}
      </body>
    </html>
  )
}
