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

// No Mapbox token (or the static map failed to load): draw the route line
// itself as an inline SVG - an ink stroke on the card, in place of the map.
function drawnRoute(routeEl: Element, a: Activity, card: Element, failedImg?: HTMLElement): void {
  const r = a.route
  if (!r || !Array.isArray(r.points) || r.points.length < 2 || !r.w || !r.h) {
    card.classList.add('sv-feat--noroute')
    return
  }
  failedImg?.remove()
  const NS = 'http://www.w3.org/2000/svg'
  const pad = Math.round(Math.max(r.w, r.h) * 0.06)
  const svg = document.createElementNS(NS, 'svg')
  svg.setAttribute('viewBox', `${-pad} ${-pad} ${r.w + pad * 2} ${r.h + pad * 2}`)
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
  svg.setAttribute('class', 'sv-feat-map sv-feat-drawn')
  svg.setAttribute('role', 'img')
  svg.setAttribute('aria-label', `Route line · ${a.name}`)
  const line = document.createElementNS(NS, 'polyline')
  line.setAttribute('points', r.points.map(([x, y]) => `${x},${y}`).join(' '))
  line.setAttribute('fill', 'none')
  line.setAttribute('stroke', 'currentColor')
  // Constant screen-pixel stroke (like Strava's own thumbnails): dense
  // out-and-back routes stay a fine line instead of smearing into a blob.
  line.setAttribute('stroke-width', '1.75')
  line.setAttribute('vector-effect', 'non-scaling-stroke')
  line.setAttribute('stroke-opacity', '0.9')
  line.setAttribute('stroke-linecap', 'round')
  line.setAttribute('stroke-linejoin', 'round')
  svg.appendChild(line)
  routeEl.appendChild(svg)
}

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
      img.alt = `Route map · ${a.name}`
      img.loading = 'lazy'
      img.decoding = 'async'
      img.addEventListener('error', () => drawnRoute(routeEl, a, card, img))
      img.src = mapboxUrl(a.polyline)
      routeEl.appendChild(img)
    } else if (routeEl) {
      drawnRoute(routeEl, a, card)
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
