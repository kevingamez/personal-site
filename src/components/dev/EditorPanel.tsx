export function EditorPanel() {
  return (
    <section className="editor">
      <div className="ed-tabs">
        <div className="et on">
          stack.ts <span className="x">×</span>
        </div>
        <div className="et">
          about.ts <span className="x">×</span>
        </div>
        <div className="et">
          conway.ts <span className="x">×</span>
        </div>
        <div className="et">
          README.md <span className="x">×</span>
        </div>
        <div className="grow"></div>
        <div className="breadcrumb">
          src › <b>stack.ts</b>
        </div>
      </div>
      <div className="ed-body">
        <div className="ed-row">
          <span className="gut">1</span>
          <span className="txt">
            <span className="cm">{'// kevin-gamez/src/stack.ts'}</span>
          </span>
        </div>
        <div className="ed-row">
          <span className="gut">2</span>
          <span className="txt">
            <span className="cm">{'// what i actually use.'}</span>
          </span>
        </div>
        <div className="ed-row">
          <span className="gut">3</span>
          <span className="txt"></span>
        </div>
        <div className="ed-row">
          <span className="gut">4</span>
          <span className="txt">
            <span className="kw">import type</span> {<span className="ty"> Tool </span>}{' '}
            <span className="kw">from</span> <span className="st">"./types"</span>;
          </span>
        </div>
        <div className="ed-row">
          <span className="gut">5</span>
          <span className="txt"></span>
        </div>
        <div className="ed-row cur">
          <span className="gut cur">6</span>
          <span className="txt">
            <span className="kw">export const</span> <span className="nm">stack</span> = &#123;
          </span>
        </div>
        <div className="ed-row">
          <span className="gut">7</span>
          <span className="txt">
            {' '}
            <span className="pn">runtime</span>: [<span className="st">"node 22"</span>],
          </span>
        </div>
        <div className="ed-row">
          <span className="gut">8</span>
          <span className="txt">
            {' '}
            <span className="pn">languages</span>: &#123;
          </span>
        </div>
        <div className="ed-row">
          <span className="gut">9</span>
          <span className="txt">
            {' '}
            <span className="pn">production</span>: [<span className="st">"typescript"</span>,{' '}
            <span className="st">"python"</span>, <span className="st">"sql"</span>],
          </span>
        </div>
        <div className="ed-row">
          <span className="gut">10</span>
          <span className="txt"> &#125;,</span>
        </div>
        <div className="ed-row">
          <span className="gut">11</span>
          <span className="txt">
            {' '}
            <span className="pn">storage</span>: [<span className="st">"postgres 16"</span>,{' '}
            <span className="st">"supabase"</span>],
          </span>
        </div>
        <div className="ed-row">
          <span className="gut">12</span>
          <span className="txt">
            {' '}
            <span className="pn">models</span>: [<span className="st">"openai"</span>,{' '}
            <span className="st">"claude"</span>],
          </span>
        </div>
        <div className="ed-row">
          <span className="gut">13</span>
          <span className="txt">
            {' '}
            <span className="pn">delivery</span>: [<span className="st">"gh actions"</span>,{' '}
            <span className="st">"vercel"</span>],
          </span>
        </div>
        <div className="ed-row">
          <span className="gut">14</span>
          <span className="txt">
            &#125; <span className="kw">as const</span> <span className="kw">satisfies</span>{' '}
            <span className="ty">Record</span>&lt;<span className="ty">string</span>,{' '}
            <span className="ty">Tool</span>[]&gt;;
          </span>
        </div>
        <div className="ed-row">
          <span className="gut">15</span>
          <span className="txt"></span>
        </div>
        <div className="ed-row">
          <span className="gut">16</span>
          <span className="txt">
            <span className="kw">export const</span> <span className="nm">summary</span> = () =&gt;
          </span>
        </div>
        <div className="ed-row">
          <span className="gut">17</span>
          <span className="txt">
            {' '}
            <span className="st">
              "mostly typescript and postgres, plus whatever the job needs."
            </span>
            ;
          </span>
        </div>
      </div>
    </section>
  )
}
