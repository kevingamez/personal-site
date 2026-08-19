// The share glyph: a node linked to two others, the platform-neutral mark both
// iOS and Android use for "send this elsewhere". currentColor so it inherits
// whatever surface it sits on; aria-hidden because every button that renders it
// carries its own accessible name.
export function ShareIcon() {
  return (
    <svg
      className="share-ico"
      viewBox="0 0 24 24"
      width="17"
      height="17"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.6 10.6l6.8-3.9M8.6 13.4l6.8 3.9" />
    </svg>
  )
}
