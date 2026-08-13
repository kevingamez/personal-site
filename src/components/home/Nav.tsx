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
        <div className="nav-links">
          <a href="#about">{t.about}</a>
          <a href="#experience">{t.experience}</a>
          <a href="#work">{t.work}</a>
          <a href="#github">{t.github}</a>
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
