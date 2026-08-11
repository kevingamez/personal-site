import type { HomeStrings } from '@/content/home'

interface Props {
  t: HomeStrings['stack']
}

export function Stack({ t }: Props) {
  return (
    <section id="stack">
      <div className="wrap">
        <div className="sec-head">
          <div>
            <div className="sec-num">{t.secNum}</div>
            <h2 className="sec-title" dangerouslySetInnerHTML={{ __html: t.titleHtml }} />
          </div>
          <p className="sec-blurb">{t.blurb}</p>
        </div>
        <div className="stack-grid">
          {t.cols.map((col, i) => (
            <div className="stack-col" key={i}>
              <div className="stack-num">0{i + 1}</div>
              <h3 className="stack-name">{col.name}</h3>
              <ul className="stack-list">
                {col.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
