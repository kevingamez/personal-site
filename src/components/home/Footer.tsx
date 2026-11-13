import type { HomeStrings } from '@/content/home'

interface Props {
  t: HomeStrings['footer']
  nav: HomeStrings['nav']
  resumeHref: string
  buildId: string
}

export function Footer({ t, nav, resumeHref }: Props) {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <div className="col-name">Kevin Gámez</div>
            <p>{t.pBlurb}</p>
          </div>
          <div>
            <h3>{t.h4Sections}</h3>
            <ul>
              {/* The same five destinations as the nav, in the same order. */}
              <li>
                <a href="#experience">{nav.experience}</a>
              </li>
              <li>
                <a href="#work">{nav.work}</a>
              </li>
              <li>
                <a href="#console">{nav.console}</a>
              </li>
              <li>
                <a href="#strava">{nav.strava}</a>
              </li>
              <li>
                <a href={resumeHref}>{nav.resume}</a>
              </li>
            </ul>
          </div>
          <div>
            <h3>{t.h4Elsewhere}</h3>
            <ul>
              <li>
                <a href="https://github.com/kevingamez" target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/kevin-gamez/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a href="https://x.com/KevinGamezA" target="_blank" rel="noopener noreferrer">
                  X
                </a>
              </li>
              <li>
                <a
                  href="https://www.strava.com/athletes/70612862"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Strava
                </a>
              </li>
              <li>
                <a href="/dev/">{t.elsewhereDev}</a>
              </li>
              <li>
                <a href="/privacy/">{t.elsewherePrivacy}</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="colophon">
          <span>{t.estab}</span>
          <a href="/humans.txt">{t.credits}</a>
        </div>
      </div>
    </footer>
  )
}
