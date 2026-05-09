// Side-effect import: pulls in the CodeMirror integration which mounts on
// `window.__cm` and dispatches the `cm-ready` event. Kept as a separate
// re-export so the dev/index entry can list it before any modules that
// expect `window.__cm` to (eventually) exist.
import '../dev-editor'
