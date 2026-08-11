import type { HomeStrings } from "@/content/home"

interface Props {
  t: HomeStrings["console"]
}

export function Console({ t }: Props) {
  return (
    <section id="console" className="console-section">
      <div className="wrap console-wrap">
        <div className="sec-head console-head">
          <div>
            <div className="sec-num console-secnum">{t.secNum}</div>
            <h2 className="sec-title console-title" dangerouslySetInnerHTML={{ __html: t.titleHtml }} />
          </div>
          <p className="sec-blurb console-blurb" dangerouslySetInnerHTML={{ __html: t.blurb }} />
        </div>

        <div className="console-shell">
          <div className="cs-tabs">
            <span className="ct-dots" aria-hidden="true">
              <i></i>
              <i></i>
              <i></i>
            </span>
            <span className="ct-prompt">{t.promptLabel}</span>
            <span className="ct-grow"></span>
            <span className="ct-meta">
              <i className="ct-led"></i>
              {t.streaming}
            </span>
          </div>

          {/* The visible stream is not a live region: it also receives the echoed
              command + tool lines, and the reply streams token-by-token, which
              would flood a screen reader. The finished reply is announced once via
              #console-status below. */}
          <div className="cs-stream" id="console-stream" aria-live="off">
            <pre className="cs-line cs-out" dangerouslySetInnerHTML={{ __html: t.greeting }} />
          </div>
          <div id="console-status" className="sr-only" role="status" aria-live="polite"></div>

          <div className="cs-suggest" id="console-suggest" aria-label="Quick commands">
            <button type="button" data-cmd={t.suggest1}>
              $ {t.suggest1}
            </button>
            <button type="button" data-cmd={t.suggest2}>
              $ {t.suggest2}
            </button>
            <button type="button" data-cmd={t.suggest3}>
              $ {t.suggest3}
            </button>
            <button type="button" data-cmd={t.suggest4}>
              $ {t.suggest4}
            </button>
          </div>

          <form className="cs-input" id="console-form" autoComplete="off">
            <span className="ci-host">kevin@gamez</span>
            <span className="ci-sep">~</span>
            <span className="ci-prompt">$</span>
            <input id="console-msg" type="text" placeholder={t.placeholder} aria-label="Console input" />
          </form>
        </div>
      </div>
    </section>
  )
}
