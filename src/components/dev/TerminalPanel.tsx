export function TerminalPanel() {
  return (
    <section className="terminal">
      <div className="term-tabs">
        <div className="tt on" data-term="zsh">
          zsh
        </div>
        <div className="tt" data-term="build">
          build:watch
        </div>
        <div className="tt" data-term="tail">
          tail -f demo.log
        </div>
        <div className="grow"></div>
        <div className="actions">⎘ split ⊕ new ↗ pop-out</div>
      </div>
      <div className="term-body" id="term">
        <div className="ln">
          <span className="gut">1</span>
          <span className="txt">
            <span className="pr">~</span> <span className="cmd">whoami</span>
          </span>
        </div>
        <div className="ln">
          <span className="gut">2</span>
          <span className="txt">
            kevin gámez · founding engineer @ enttor · <span className="ac">bogotá / utc-5</span>
          </span>
        </div>
        <div className="ln">
          <span className="gut">3</span>
          <span className="txt">
            <span className="pr">~</span>{' '}
            <span className="cmd">curl -s api.github.com/users/kevingamez | jq</span>
          </span>
        </div>
        <div className="ln">
          <span className="gut">4</span>
          <span className="txt">
            <span className="gr">&#123;</span> <span className="em">"public_repos"</span>:{' '}
            <span className="ok">28</span>, <span className="em">"followers"</span>:{' '}
            <span className="ok">14</span>, <span className="em">"created_at"</span>:{' '}
            <span className="ac">"2019-04-16"</span> <span className="gr">&#125;</span>
          </span>
        </div>
        <div className="ln">
          <span className="gut">5</span>
          <span className="txt">
            <span className="pr">~</span> <span className="cmd">help</span>
          </span>
        </div>
        <div className="ln">
          <span className="gut">6</span>
          <span className="txt">
            <span className="gr">commands:</span> <span className="ac">about</span>{' '}
            <span className="ac">work</span> <span className="ac">stack</span>{' '}
            <span className="ac">repos</span> <span className="ac">contact</span>{' '}
            <span className="ac">life</span> <span className="ac">vim</span>{' '}
            <span className="ac">clear</span>
          </span>
        </div>
        <div className="ln">
          <span className="gut">7</span>
          <span className="txt">
            <span className="pr">~</span> <span className="cu"></span>
          </span>
        </div>
      </div>
      <div className="term-input">
        <span className="pr" id="prompt">
          ~ $
        </span>
        <input
          id="cmd"
          placeholder="try ls, cat src/about.ts, vim README.md, help…"
          autoComplete="off"
        />
        <span className="hint">↵ run · ↑ history · ⌃L clear</span>
      </div>
      <div className="term-body term-stream" id="term-build" hidden></div>
      <div className="term-body term-stream" id="term-tail" hidden></div>
    </section>
  )
}
