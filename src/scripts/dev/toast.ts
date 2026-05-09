// Bottom toast for saved/error messages. ARIA live region added so screen
// readers announce the change without yanking focus.

let toastEl: HTMLElement | null = null
let toastTimer: ReturnType<typeof setTimeout> | null = null

export function initToast(): void {
  toastEl = document.getElementById('toast')
  if (toastEl) {
    toastEl.setAttribute('role', 'status')
    toastEl.setAttribute('aria-live', 'polite')
  }
}

export function showToast(msg: string): void {
  if (!toastEl) toastEl = document.getElementById('toast')
  if (!toastEl) return
  toastEl.textContent = msg
  toastEl.classList.add('show')
  if (toastTimer !== null) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => toastEl?.classList.remove('show'), 1500)
}
