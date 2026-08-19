// The ambient light every glass surface on the page refracts. Purely
// decorative and fixed behind the whole document, so it renders once at the
// top of the tree rather than per section. The gradients themselves live in
// src/styles/home/glass.css.
export function GlassField() {
  return <div className="glass-field" aria-hidden="true" />
}
