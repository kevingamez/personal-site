import type { HomeStrings } from '@/content/home'
import { Moments } from './Moments'

interface Props {
  t: HomeStrings['deck']
}

export function Deck({ t }: Props) {
  return (
    <section id="deck" className="deck-section">
      <div className="wrap">
        <div className="sec-head">
          <div>
            <div className="sec-num">{t.secNum}</div>
            <h2 className="sec-title" dangerouslySetInnerHTML={{ __html: t.titleHtml }} />
          </div>
          <p className="sec-blurb">{t.blurb}</p>
        </div>
        <Moments t={t} />
      </div>
    </section>
  )
}
