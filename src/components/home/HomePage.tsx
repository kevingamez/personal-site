// The full home page tree, shared by the EN (/) and ES (/es/) routes.
// Sections are server components ported 1:1 from their .astro sources;
// interactivity comes from the vanilla scripts loaded by <HomeScripts/>.

import '@/styles/home/index.css'

import type { HomeStrings } from '@/content/home'
import type { HomeStats } from '@/data/home-github'
import { JsonLd } from '@/components/site/JsonLd'
import { Nav } from './Nav'
import { IntroCurtain } from './IntroCurtain'
import { Hero } from './Hero'
import { About } from './About'
import { Stack } from './Stack'
import { Experience } from './Experience'
import { Work } from './Work'
import { Deck } from './Deck'
import { Github } from './Github'
import { Strava } from './Strava'
import { Writing } from './Writing'
import { Console } from './Console'
import { Contact } from './Contact'
import { Footer } from './Footer'
import { HomeScripts } from './HomeScripts'

const buildId = 'a7f3c91'

export function HomePage({ t, stats }: { t: HomeStrings; stats: HomeStats }) {
  return (
    <>
      {t.meta.includeJsonLd && <JsonLd meta={t.meta} />}
      <a className="skip" href="#main">
        {t.meta.skip}
      </a>

      <IntroCurtain name="Kevin Gámez" />
      <Nav meta={t.meta} t={t.nav} />
      <main id="main" tabIndex={-1}>
        <Hero t={t.hero} />
        <About t={t.about} tGol={t.hero} />
        <Stack t={t.stack} />
        <Experience t={t.experience} />
        <Work t={t.work} />
        <Deck t={t.deck} />
        <Github t={t.github} stats={stats} />
        <div className="strava-lazy-anchor" data-strava-lazy-anchor aria-hidden="true"></div>
        <Strava t={t.strava} />
        <Writing t={t.writing} />
        <Console t={t.console} />
        <Contact t={t.contact} />
      </main>
      <Footer t={t.footer} buildId={buildId} />

      <HomeScripts />
    </>
  )
}
