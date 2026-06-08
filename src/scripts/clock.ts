// Live local clock for Bogotá (UTC-5). Renders 24h HH:MM into any element
// carrying [data-bogota-clock] and refreshes at the top of each minute.
// The same formatter seeds the server-rendered value at build time so there's
// no empty flash before the client script runs.

const fmt = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'America/Bogota',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

export function formatBogotaTime(date = new Date()): string {
  return fmt.format(date)
}

export function initBogotaClock(): void {
  const els = document.querySelectorAll<HTMLElement>('[data-bogota-clock]')
  if (els.length === 0) return

  const tick = (): void => {
    const now = formatBogotaTime()
    for (const el of els) el.textContent = now
    // Re-fire just after the next minute boundary (minutes tick on the same
    // epoch instants in every timezone, so UTC arithmetic stays correct).
    window.setTimeout(tick, 60_000 - (Date.now() % 60_000) + 50)
  }

  tick()
}
