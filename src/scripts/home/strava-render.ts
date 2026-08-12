// DOM render functions: longest-effort card grid and the insight/metric tiles.

import type { Activity, Insights, Totals } from './strava-types'
import { MAPBOX_TOKEN, mapboxUrl } from './strava-map'
import {
  DUNIT,
  EUNIT,
  FOOT_SPORTS,
  PACE_LABEL,
  SPEED_LABEL,
  SPORTS,
  SUNIT,
  WEEK_OF,
  countUp,
  countUpEl,
  distVal,
  dur,
  elevVal,
  pace,
  setText,
  shortDate,
  spdVal,
} from './strava-units'

export function renderLongest(host: HTMLElement, tpl: HTMLTemplateElement, acts: Activity[]): void {
  host.replaceChildren()
  for (const a of acts) {
    const frag = tpl.content.cloneNode(true) as DocumentFragment
    const card = frag.querySelector('.sv-feat')
    if (!card) continue

    const sportEl = frag.querySelector('[data-sport]')
    if (sportEl) sportEl.textContent = SPORTS[a.sportType] || a.sportType
    const nameEl = frag.querySelector('[data-name]') as HTMLAnchorElement | null
    if (nameEl) {
      nameEl.textContent = a.name
      nameEl.href = a.url
    }
    const routeEl = frag.querySelector('[data-route]')
    if (routeEl && MAPBOX_TOKEN && a.polyline) {
      const img = document.createElement('img')
      img.className = 'sv-feat-map'
      img.alt = `Route map, ${a.name}`
      img.loading = 'lazy'
      img.decoding = 'async'
      img.addEventListener('error', () => card.classList.add('sv-feat--noroute'))
      img.src = mapboxUrl(a.polyline)
      routeEl.appendChild(img)
    } else {
      card.classList.add('sv-feat--noroute')
    }
    countUpEl(
      frag.querySelector('[data-dist]'),
      distVal(a.distanceM),
      (n) => `${n.toFixed(1)} ${DUNIT}`
    )
    countUpEl(
      frag.querySelector('[data-elev]'),
      elevVal(a.elevationM),
      (n) => `${Math.round(n).toLocaleString()} ${EUNIT}`
    )
    countUpEl(frag.querySelector('[data-time]'), a.movingTime, (n) => dur(n))
    // Runs/hikes report pace; rides report speed.
    const speedEl = frag.querySelector('[data-speed]')
    const speedLabelEl = frag.querySelector('[data-speedlabel]')
    if (FOOT_SPORTS.has(a.sportType)) {
      if (speedLabelEl) speedLabelEl.textContent = PACE_LABEL
      if (speedEl) speedEl.textContent = pace(a.distanceM, a.movingTime)
    } else {
      if (speedLabelEl) speedLabelEl.textContent = SPEED_LABEL
      countUpEl(speedEl, spdVal(a.avgSpeedMs), (n) => `${n.toFixed(1)} ${SUNIT}`)
    }
    host.appendChild(frag)
  }
}

export function fillInsights(ins: Insights, totals: Totals, lang: string): void {
  if (ins.biggestClimb) {
    countUp(
      'sv-climb-val',
      elevVal(ins.biggestClimb.elevationM),
      (n) => `${Math.round(n).toLocaleString(lang)} ${EUNIT}`
    )
    setText('sv-climb-sub', ins.biggestClimb.name)
  }
  if (ins.fastest) {
    countUp('sv-fast-val', spdVal(ins.fastest.avgSpeedMs), (n) => `${n.toFixed(1)} ${SUNIT}`)
    setText('sv-fast-sub', ins.fastest.name)
  }
  countUp('sv-biggest-val', distVal(ins.biggestWeekDistanceM), (n) => `${Math.round(n)} ${DUNIT}`)
  if (ins.biggestWeekStart)
    setText('sv-biggest-sub', `${WEEK_OF} ${shortDate(ins.biggestWeekStart, lang)}`)
  countUp(
    'sv-climbed-val',
    elevVal(totals.elevationM),
    (n) => `${Math.round(n).toLocaleString(lang)} ${EUNIT}`
  )
}
