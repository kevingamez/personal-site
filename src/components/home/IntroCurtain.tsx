// First-load intro curtain: the name wipes in over paper while a counter and a
// hairline progress bar run 0 -> 100, then the curtain slides up. Any input
// skips it. It only ever renders when public/head-init.js adds `intro-pending`
// to <html> pre-paint (first visit this session, motion allowed) - without JS
// or under reduced motion it stays display:none and costs nothing.
interface Props {
  name: string
}

export function IntroCurtain({ name }: Props) {
  return (
    <div className="intro" aria-hidden="true">
      <span className="intro-word">{name}</span>
      <div className="intro-meta">
        <span data-intro-count="">000</span>
        <span className="intro-bar">
          <span className="intro-bar-fill" data-intro-bar=""></span>
        </span>
      </div>
    </div>
  )
}
