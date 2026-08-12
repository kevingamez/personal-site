// Fills the hero caption with current conditions in Bogotá, fetched from our
// own /api/weather so no third-party host is involved (and so the CSP needs no
// new entry). Purely additive: if the request fails the caption keeps showing
// the city and the clock, and nothing shifts.

type Weather = { tempC: number | null; condition: string | null }

export async function initWeather(): Promise<void> {
  const slot = document.querySelector<HTMLElement>('[data-weather]')
  if (!slot) return

  // Localized condition labels ride along on the element, so this module stays
  // language-agnostic like the rest of src/scripts.
  let labels: Record<string, string> = {}
  try {
    labels = JSON.parse(slot.dataset.weatherLabels || '{}')
  } catch {
    labels = {}
  }

  let data: Weather
  try {
    // trailing slash: next.config.ts sets trailingSlash, so skip the 308 hop
    const res = await fetch('/api/weather/')
    if (!res.ok) return
    data = (await res.json()) as Weather
  } catch {
    return
  }

  if (typeof data.tempC !== 'number') return
  const label = data.condition ? labels[data.condition] : null
  slot.textContent = label ? `${data.tempC}°, ${label}` : `${data.tempC}°`
  slot.classList.add('on')
}
