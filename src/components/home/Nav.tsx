import type { HomeStrings } from '@/content/home'

interface Props {
  meta: HomeStrings['meta']
  t: HomeStrings['nav']
}

export function Nav({ meta, t }: Props) {
  return (
    <nav className="nav">
      {/* The bar is a glass capsule floating inside the gutter rather than a
          band pinned to the viewport edge, so the page visibly runs under and
          past it. .wrap keeps it on the same measure as every section. */}
      <div className="wrap">
        <div className="nav-in glass">
          <a className="brand" href={meta.brandHref}>
            Kevin Gámez
          </a>
          {/* Every section on the page, in the order the page presents them.
            Four of the nine used to be missing here (the deck, Strava, the
            writing feed, the console), which left them reachable only by
            scrolling far enough to find them. */}
          <div className="nav-links">
            {/* <a href="#about">{t.about}</a> */}
            <a href="#experience">{t.experience}</a>
            <a href="#work">{t.work}</a>
            <a href="#deck">{t.deck}</a>
            {/* <a href="#github">{t.github}</a> */}
            <a href="#strava">{t.strava}</a>
            {/* <a href="#writing">{t.writing}</a> */}
            <a href="#console">{t.console}</a>
            <a href="/resume/">{t.resume}</a>
          </div>
          <div className="nav-right">
            <a className="say-hi" href="#contact">
              {t.sayHi}
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}
