import { formatBogotaTime } from "@/scripts/clock"

interface Props {
  buildId: string
}

export function Titlebar({ buildId }: Props) {
  return (
    <>
      <div className="titlebar">
        <div className="l">
          <div className="dots"><span></span><span></span><span></span></div>
          <div className="ttl">kevin@gamez · <b>~/dev</b> · 1452 × 902</div>
        </div>
        <div className="r">
          <span><span className="led"></span>live · build {buildId}</span>
          <a className="back" href="/">← exit dev mode</a>
        </div>
      </div>

      <div className="tabsbar">
        <div className="tab on" data-ws="workspace"><span className="num">1</span>workspace</div>
        <div className="tab muted" data-ws="scratchpad"><span className="num">2</span>scratchpad</div>
        <div className="tab muted" data-ws="changelog"><span className="num">3</span>changelog</div>
        <div className="grow"></div>
        <div className="live">utc-5 · bogotá · <b data-bogota-clock>{formatBogotaTime()}</b></div>
      </div>
    </>
  )
}
