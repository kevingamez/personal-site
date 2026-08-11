export function Workspaces() {
  return (
    <>
      <section className="scratchpad" hidden>
        <div className="ed-tabs">
          <div className="et on">scratchpad <span className="x">×</span></div>
          <div className="grow"></div>
          <div className="breadcrumb">~ › <b>scratchpad</b></div>
        </div>
        <textarea
          className="scratch-area"
          id="scratch"
          spellCheck="false"
          placeholder="// scratch space · ⌃1/⌃2/⌃3 to switch workspaces · saved locally only"></textarea>
      </section>

      <section className="changelog-view" hidden>
        <div className="ed-tabs">
          <div className="et on">CHANGELOG.md <span className="x">×</span></div>
          <div className="grow"></div>
          <div className="breadcrumb"><b>CHANGELOG.md</b></div>
        </div>
        <article className="changelog-body" id="changelog-body"></article>
      </section>
    </>
  )
}
