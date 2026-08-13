import type { HomeStrings } from '@/content/home'

interface Props {
  t: HomeStrings['footer']
  buildId: string
}

export function Footer({ t }: Props) {
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
              <li>
                <a href="#about">{t.sectionsAbout}</a>
              </li>
              <li>
                <a href="#experience">{t.sectionsExperience}</a>
              </li>
              <li>
                <a href="#work">{t.sectionsWork}</a>
              </li>
              <li>
                <a href="#github">{t.sectionsGithub}</a>
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
