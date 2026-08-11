import type { HomeStrings } from '@/content/home'

interface Props {
  t: HomeStrings['deck']
}

export function Deck({ t }: Props) {
  const rotations = [-7, -3.5, 0, 3.5, 7]

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
        <div className="deck-stage" data-deck="">
          <div className="deck-fan" role="tablist" aria-label={t.hint}>
            {t.items.map((card, i) => (
              <button
                className={i === 0 ? 'deck-card active' : 'deck-card'}
                id={`deck-tab-${i}`}
                role="tab"
                aria-selected={i === 0 ? 'true' : 'false'}
                aria-controls={`deck-panel-${i}`}
                tabIndex={i === 0 ? 0 : -1}
                data-deck-card={i}
                style={{ '--rot': `${rotations[i]}deg`, '--i': i } as React.CSSProperties}
                key={i}
              >
                <span className="dc-num">0{i + 1}</span>
                <span className="dc-label">{card.label}</span>
              </button>
            ))}
          </div>
          <div className="deck-panels">
            {t.items.map((card, i) => (
              <div
                className="deck-panel"
                id={`deck-panel-${i}`}
                role="tabpanel"
                aria-labelledby={`deck-tab-${i}`}
                hidden={i !== 0}
                tabIndex={0}
                key={i}
              >
                <p className="dp-statement">{card.statement}</p>
                <p className="dp-body" dangerouslySetInnerHTML={{ __html: card.bodyHtml }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
