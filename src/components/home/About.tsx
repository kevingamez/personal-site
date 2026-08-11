import type { HomeStrings } from "@/content/home"

interface Props {
  t: HomeStrings["about"]
  // Game of Life strings live under hero.* historically; the canvas moved here
  // when the Vela hero took the portrait.
  tGol: HomeStrings["hero"]
}

export function About({ t, tGol }: Props) {
  return (
    <section id="about">
      <div className="wrap">
        <div className="sec-head">
          <div>
            <div className="sec-num">{t.secNum}</div>
            <h2 className="sec-title" dangerouslySetInnerHTML={{ __html: t.titleHtml }} />
          </div>
          <p className="sec-blurb">{t.blurb}</p>
        </div>
        <div className="about-grid">
          <div className="gol-wrap">
            <div className="gol-frame">
              <canvas id="gol" role="img" aria-label={tGol.golAriaLabel}></canvas>
              <div className="gol-controls">
                <button
                  className="gol-btn"
                  id="gol-pause"
                  title={tGol.pauseTitle}
                  aria-label={tGol.pauseTitle}
                  aria-pressed="false">⏸</button>
                <button className="gol-btn" id="gol-reset" title={tGol.resetTitle} aria-label={tGol.resetTitle}>↻</button>
              </div>
              <div className="gol-stamps">
                <button className="gol-stamp on" data-stamp="glider" aria-pressed="true">{tGol.stampGlider}</button>
                <button className="gol-stamp" data-stamp="lwss" aria-pressed="false">{tGol.stampLwss}</button>
                <button className="gol-stamp" data-stamp="pulsar" aria-pressed="false">{tGol.stampPulsar}</button>
                <button className="gol-stamp" data-stamp="gun" aria-pressed="false">{tGol.stampGun}</button>
                <button className="gol-stamp" data-stamp="clear">{tGol.stampClear}</button>
              </div>
            </div>
            <div className="gol-readout">
              <span>{tGol.gen} <b id="gol-gen">0</b></span>
              <span>{tGol.alive} <b id="gol-alive">0</b></span>
              <span>{tGol.fps} <b id="gol-fps">0</b></span>
            </div>
            <p className="gol-note" dangerouslySetInnerHTML={{ __html: tGol.golCaptionHtml }} />
          </div>
          <div className="about-prose">
            <p dangerouslySetInnerHTML={{ __html: t.p1Html }} />
            <p dangerouslySetInnerHTML={{ __html: t.p2Html }} />
            <p dangerouslySetInnerHTML={{ __html: t.p3Html }} />
            <div className="quick-facts">
              <div className="qf"><div className="k">{t.qfBased}</div><div className="v">{t.qfBasedV}</div></div>
              <div className="qf">
                <div className="k">{t.qfRole}</div><div className="v">{t.qfRoleV}</div>
              </div>
              <div className="qf">
                <div className="k">{t.qfStack}</div><div className="v">{t.qfStackV}</div>
              </div>
              <div className="qf">
                <div className="k">{t.qfObsessed}</div>
                <div className="v" dangerouslySetInnerHTML={{ __html: t.qfObsessedV }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
