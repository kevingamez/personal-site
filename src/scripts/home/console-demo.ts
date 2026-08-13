// The console types a short session to itself the first time it scrolls into
// view, so the window is never a dead black rectangle waiting to be discovered.
//
// Local commands ONLY. An AI question would be the better demo, but /api/chat
// is rate limited per IP and globally, and firing one on every page view would
// spend the day's budget on people who never asked a thing.
//
// It yields to the visitor completely: the first pointer, key or focus anywhere
// in the section stops it mid-word and leaves the prompt alone.

const SCRIPT = ['whoami', 'experience']
const TYPE_MS = 42
const PAUSE_BEFORE_ENTER_MS = 260
const PAUSE_BETWEEN_MS = 700

export interface DemoDeps {
  input: HTMLInputElement
  section: HTMLElement
  // Runs a line exactly as if it had been submitted, minus the history entry:
  // the visitor's own up-arrow history should not start with someone else's
  // commands.
  run: (command: string) => void
}

const wait = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

export function initConsoleDemo({ input, section, run }: DemoDeps): void {
  if (typeof IntersectionObserver === 'undefined') return

  let aborted = false
  // Whether the demo currently owns the input. Guarding the clear on this is
  // load-bearing: the abort listener runs in the CAPTURE phase, so without it
  // the Enter key that submits the visitor's first command would wipe the line
  // before the form's own submit handler ever read it.
  let typing = false
  const abort = (): void => {
    aborted = true
    // Never leave a half-typed word in the box the visitor is about to use.
    if (typing && !input.disabled) input.value = ''
    typing = false
  }

  // Any sign of a real person takes precedence, including the keyboard shortcut
  // that focuses the input from elsewhere on the page.
  for (const evt of ['pointerdown', 'keydown', 'focusin'] as const) {
    section.addEventListener(evt, abort, { once: true, capture: true })
  }

  const reduced =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  async function play(): Promise<void> {
    typing = true
    try {
      for (const command of SCRIPT) {
        if (aborted) return
        if (reduced) {
          // Same session, no typing animation: the point is a window with
          // something in it, not the keystrokes.
          input.value = ''
          run(command)
          continue
        }
        for (const ch of command) {
          if (aborted) return
          input.value += ch
          await wait(TYPE_MS)
        }
        await wait(PAUSE_BEFORE_ENTER_MS)
        if (aborted) return
        input.value = ''
        run(command)
        await wait(PAUSE_BETWEEN_MS)
      }
    } finally {
      // Hand the input back: from here the visitor's keystrokes are their own.
      typing = false
    }
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        io.disconnect()
        // A visitor who already typed something owns the console; don't type over them.
        if (aborted || input.value || input.disabled) return
        void play()
        return
      }
    },
    { threshold: 0.35 }
  )
  io.observe(section)
}
