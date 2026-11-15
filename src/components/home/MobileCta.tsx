import type { HomeStrings } from '@/content/home'
import { ShareIcon } from './ShareIcon'

interface Props {
  t: HomeStrings['contact']
  nav: HomeStrings['nav']
  meta: HomeStrings['meta']
}

// The phone's navigation, where a thumb already is. One bar at the bottom: the
// left half says which section you are in and opens the menu, the right half
// is the page's one ask. It replaced a two-row bar at the top whose links ran
// off the right edge (the last one was never visible without a sideways
// swipe) and a second bar down here that only carried the email button.
//
// Hidden above 899px, where the desktop nav has room for everything. The
// sheet stays mounted so it can animate out, and is `inert` while closed so
// it cannot take focus or a tap; src/scripts/home/mobile-nav.ts drives both.
export function MobileCta({ t, nav, meta }: Props) {
  const isEnglish = meta.htmlLang === 'en'

  return (
    <div className="mcta" id="mobile-cta" data-mobile-cta>
      <div className="mnav-sheet" id="mnav-sheet" data-mnav-sheet inert>
        <nav className="mnav-links" aria-label={nav.menu}>
          <a href="#experience" data-mnav-link="experience">
            {nav.experience}
          </a>
          <a href="#work" data-mnav-link="work">
            {nav.work}
          </a>
          <a href="#console" data-mnav-link="console">
            {nav.console}
          </a>
          <a href="#strava" data-mnav-link="strava">
            {nav.strava}
          </a>
          <a href={isEnglish ? '/resume/' : '/es/resume/'}>{nav.resume}</a>
        </nav>
        <div className="mnav-foot">
          <a
            href={isEnglish ? '/?lang=es' : '/?lang=en'}
            hrefLang={isEnglish ? 'es' : 'en'}
            aria-label={isEnglish ? nav.switchToSpanishAria : nav.switchToEnglishAria}
          >
            {isEnglish ? nav.switchToSpanish : nav.switchToEnglish}
          </a>
          <button
            type="button"
            data-share
            data-share-text={t.shareText}
            data-share-copied={t.shareCopied}
            data-share-failed={t.shareFailed}
          >
            <ShareIcon />
            <span data-share-label>{t.btnShare}</span>
          </button>
        </div>
      </div>

      <div className="mcta-in glass">
        <button
          className="mnav-toggle"
          type="button"
          aria-expanded="false"
          aria-controls="mnav-sheet"
          data-mnav-toggle
          data-mnav-default={nav.menu}
        >
          <span className="mnav-ico" aria-hidden="true">
            <i />
            <i />
          </span>
          <span data-mnav-label>{nav.menu}</span>
        </button>
        <a className="mcta-email" href="mailto:kevingamez.kg@gmail.com" data-cta="mobile-email">
          {t.ctaEmail}
        </a>
      </div>
    </div>
  )
}
