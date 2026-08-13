import type { HomeStrings } from '@/content/home'

interface Props {
  meta: HomeStrings['meta']
  t: HomeStrings['nav']
}

export function Nav({ meta, t }: Props) {
  return (
    <nav className="nav">
      <div className="wrap nav-in">
        <a className="brand" href={meta.brandHref}>
          Kevin Gámez
        </a>
        {/* Every section on the page, in the order the page presents them.
            Four of the nine used to be missing here (the deck, Strava, the
            writing feed, the console), which left them reachable only by
            scrolling far enough to find them. */}
        <div className="nav-links">
          <a href="#about">{t.about}</a>
          <a href="#experience">{t.experience}</a>
          <a href="#work">{t.work}</a>
          <a href="#deck">{t.deck}</a>
          <a href="#github">{t.github}</a>
          <a href="#strava">{t.strava}</a>
          <a href="#writing">{t.writing}</a>
          <a href="#console">{t.console}</a>
          <a href="/resume/">{t.resume}</a>
        </div>
        <div className="nav-right">
          <a className="say-hi" href="#contact">
            {t.sayHi}
          </a>
        </div>
      </div>
    </nav>
  )
}
