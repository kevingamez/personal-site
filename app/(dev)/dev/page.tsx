import type { Metadata } from 'next'
import { Titlebar } from '@/components/dev/Titlebar'
import { ActivityBar } from '@/components/dev/ActivityBar'
import { Explorer } from '@/components/dev/Explorer'
import { SourceControl } from '@/components/dev/SourceControl'
import { Profile } from '@/components/dev/Profile'
import { Settings } from '@/components/dev/Settings'
import { EditorPanel } from '@/components/dev/EditorPanel'
import { TerminalPanel } from '@/components/dev/TerminalPanel'
import { Workspaces } from '@/components/dev/Workspaces'
import { Sidebar } from '@/components/dev/Sidebar'
import { StatusBar } from '@/components/dev/StatusBar'
import { CommandPalette } from '@/components/dev/CommandPalette'
import { DevScripts } from '@/components/dev/DevScripts'
import { buildDevData, serializeDevData } from '@/data/dev'
import '@/styles/dev/index.css'
import '@/styles/dev/enter.css'

const TITLE = 'kevin@gamez ~/dev - dev mode'
const DESCRIPTION = 'Dev-mode portfolio of Kevin Gámez - a terminal-styled view of the same person.'
const OG_IMAGE = 'https://kevingamez.co/og-dev-preview.png'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  robots: { index: false, follow: true },
  alternates: { canonical: 'https://kevingamez.co/dev/' },
  openGraph: {
    type: 'website',
    url: 'https://kevingamez.co/dev/',
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: OG_IMAGE,
        secureUrl: OG_IMAGE,
        type: 'image/png',
        width: 1200,
        height: 630,
        alt: 'Kevin Gámez dev mode - terminal-styled portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
}

const buildId = 'a7f3c91'

export default async function Page() {
  const devDataJson = serializeDevData(await buildDevData())

  return (
    <>
      <div className="desktop">
        <div className="dev-window">
          <Titlebar buildId={buildId} />

          <div className="app">
            <ActivityBar />
            <Explorer />
            <SourceControl />
            <Profile />
            <Settings />

            <main className="center">
              <EditorPanel />
              <TerminalPanel />
              <Workspaces />
            </main>

            <Sidebar />
          </div>

          <StatusBar />
        </div>
      </div>

      <CommandPalette />

      <script
        id="dev-data"
        type="application/json"
        dangerouslySetInnerHTML={{ __html: devDataJson }}
      />

      <DevScripts />
    </>
  )
}
