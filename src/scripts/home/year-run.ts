// Draws the "year, and what was running" figure: a weekly contribution curve
// with the product lanes underneath, so the peaks have a visible cause.
//
// Vanilla, loaded after hydration like the rest of src/scripts/home. The reveal
// runs once when the section scrolls into view, and is skipped under
// prefers-reduced-motion. Geometry and derived facts live in year-run-scales.

import {
  activeIn,
  busiestStarted,
  CH_H,
  CH_TOP,
  clampLanes,
  el,
  fmtDay,
  fmtMon,
  H_AXIS,
  LANE_BAR,
  LANE_H,
  LANE_TOP,
  laneStep,
  longestStreak,
  makeScales,
  PAD_L,
  PAD_R,
  smooth,
  toWeeks,
  W,
  type Payload,
} from './year-run-scales'

const LANES_Y = [14, 62, 110]

export function initYearRun(): void {
  const svg = document.getElementById('yr-chart') as SVGSVGElement | null
  const data = document.getElementById('yr-data')
  const tip = document.getElementById('yr-tip')
  if (!svg || !data || !tip) return

  let payload: Payload
  try {
    payload = JSON.parse(data.textContent || '')
  } catch {
    return
  }

  const days = payload.days.map(([date, count]) => ({ date, count }))
  if (days.length < 14) return
  const L = payload.labels
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

  const weeks = toWeeks(days)
  const first = days[0].date
  const last = days[days.length - 1].date
  const lanes = clampLanes(payload.projects, first, last)
  if (!lanes.length) return

  const { N, xAt, xw, yv } = makeScales(weeks, first, last)
  const H = LANE_TOP + lanes.length * LANE_H + H_AXIS + 10
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`)

  const pts = weeks.map((w, i) => [xw(i), yv(w.total)] as [number, number])
  const dCurve = smooth(pts)

  // ── static parts ──
  const defs = el('defs')
  const grad = el('linearGradient', { id: 'yr-wash', x1: 0, y1: 0, x2: 0, y2: 1 })
  grad.appendChild(el('stop', { offset: '0%', 'stop-color': '#7c5cff', 'stop-opacity': '0.24' }))
  grad.appendChild(el('stop', { offset: '100%', 'stop-color': '#7c5cff', 'stop-opacity': '0.015' }))
  defs.appendChild(grad)
  svg.appendChild(defs)

  let lastM = ''
  weeks.forEach((w, i) => {
    const m = w.start.slice(0, 7)
    if (m !== lastM && i > 0) {
      lastM = m
      svg.appendChild(
        el('line', { class: 'yr-grid', x1: xw(i), y1: CH_TOP - 10, x2: xw(i), y2: H - H_AXIS })
      )
      const t = el('text', { class: 'yr-axis', x: xw(i) + 6, y: H - H_AXIS + 18 })
      t.textContent = new Date(w.start + 'T00:00:00').toLocaleDateString('en', { month: 'short' })
      svg.appendChild(t)
    }
  })

  const area = el('path', {
    class: 'yr-area',
    d: `${dCurve} L ${xw(N - 1)},${CH_TOP + CH_H} L ${xw(0)},${CH_TOP + CH_H} Z`,
  })
  svg.appendChild(area)
  const path = el('path', { class: 'yr-curve', d: dCurve }) as SVGPathElement
  svg.appendChild(path)
  const head = el('circle', { class: 'yr-head', r: 5, cx: pts[0][0], cy: pts[0][1] })
  svg.appendChild(head)

  const laneEls = lanes.map((p, i) => {
    const y = LANE_TOP + i * LANE_H
    const label = el('text', {
      class: 'yr-lane-label',
      x: PAD_L - 14,
      y: y + LANE_BAR / 2,
      'text-anchor': 'end',
    })
    label.textContent = p.label
    svg.appendChild(label)
    svg.appendChild(
      el('rect', {
        class: 'yr-lane-track',
        x: PAD_L,
        y: y + LANE_BAR / 2 - 1,
        width: W - PAD_L - PAD_R,
        height: 2,
      })
    )
    const x0 = xAt(p.from)
    const x1 = Math.max(x0 + 3, xAt(p.to))
    const bar = el('rect', {
      class: `yr-lane-bar is-${laneStep(p)}`,
      x: x0,
      y,
      width: 0,
      height: LANE_BAR,
    })
    svg.appendChild(bar)
    const count = el('text', { class: 'yr-lane-count', x: x1 + 10, y: y + LANE_BAR / 2 })
    count.textContent = p.commits.toLocaleString('en')
    svg.appendChild(count)
    return { bar, count, x0, w: x1 - x0 }
  })

  // ── the moments worth annotating ──
  const peakWeekIdx = weeks.indexOf(weeks.reduce((a, w) => (w.total > a.total ? w : a), weeks[0]))
  const streak = longestStreak(days)
  const busiest = busiestStarted(lanes)
  const startIdx = weeks.findIndex((w) => w.start >= busiest.from)
  const busiestWeek = Math.max(1, startIdx)

  const stops = [
    { i: busiestWeek, title: `${busiest.label} ${L.begins}`, sub: fmtMon(busiest.from), lane: 0 },
    {
      i: Math.floor(streak.end / 7),
      title: `${streak.len} ${L.streak}`,
      sub: `${fmtMon(days[streak.start].date)} to ${fmtMon(days[streak.end].date)}`,
      lane: 2,
    },
    {
      i: peakWeekIdx,
      title: `${weeks[peakWeekIdx].total} ${L.week}`,
      sub: `${activeIn(lanes, weeks[peakWeekIdx]).length} ${L.atOnce}`,
      lane: 1,
    },
  ].sort((a, b) => a.i - b.i)

  const noteEls = stops.map((s) => {
    const g = el('g', { class: 'yr-note' })
    const px = xw(s.i)
    const py = yv(weeks[s.i].total)
    const ty = LANES_Y[s.lane]
    g.appendChild(el('line', { class: 'yr-note-stem', x1: px, y1: py, x2: px, y2: ty + 6 }))
    g.appendChild(el('circle', { class: 'yr-note-dot', cx: px, cy: py, r: 5 }))
    const a = el('text', { class: 'yr-note-title', y: ty })
    a.textContent = s.title
    const b = el('text', { class: 'yr-note-sub', y: ty + 16 })
    b.textContent = s.sub
    g.appendChild(a)
    g.appendChild(b)
    svg.appendChild(g)
    // measure, then flip the label inward if it would run past the plot edge
    const widest = Math.max(
      (a as SVGTextElement).getComputedTextLength(),
      (b as SVGTextElement).getComputedTextLength()
    )
    const flip = px + 12 + widest > W - PAD_R
    ;[a, b].forEach((n) => {
      n.setAttribute('x', String(flip ? px - 12 : px + 12))
      n.setAttribute('text-anchor', flip ? 'end' : 'start')
    })
    return g
  })

  // ── hover ──
  const cross = el('line', { class: 'yr-cross', y1: CH_TOP - 10, y2: H - H_AXIS })
  svg.appendChild(cross)
  const hoverDot = el('circle', { class: 'yr-note-dot', r: 5, opacity: 0 })
  svg.appendChild(hoverDot)
  svg.appendChild(
    el('rect', { class: 'yr-hit', x: PAD_L, y: 0, width: W - PAD_L - PAD_R, height: H - H_AXIS })
  )
  const frame = svg.parentElement as HTMLElement

  svg.addEventListener('pointermove', (e) => {
    const r = svg.getBoundingClientRect()
    const vx = ((e.clientX - r.left) / r.width) * W
    const i = Math.max(
      0,
      Math.min(N - 1, Math.round(((vx - PAD_L) / (W - PAD_L - PAD_R)) * (N - 1)))
    )
    const w = weeks[i]
    const px = xw(i)
    const py = yv(w.total)
    const active = activeIn(lanes, w)
    cross.setAttribute('x1', String(px))
    cross.setAttribute('x2', String(px))
    cross.classList.add('on')
    hoverDot.setAttribute('cx', String(px))
    hoverDot.setAttribute('cy', String(py))
    hoverDot.setAttribute('opacity', '1')
    tip.innerHTML =
      `<b>${w.total}</b> ${L.contributions}<div class="yr-tip-wk">${L.weekOf} ${fmtDay(w.start)}</div>` +
      (active.length
        ? `<ul>${active.map((a) => `<li>${a.label}</li>`).join('')}</ul>`
        : `<ul><li class="yr-tip-none">${L.nothing}</li></ul>`)
    const fr = frame.getBoundingClientRect()
    tip.style.left = `${(px / W) * fr.width}px`
    tip.style.top = `${(py / H) * fr.height + 24}px`
    tip.classList.add('on')
  })
  svg.addEventListener('pointerleave', () => {
    cross.classList.remove('on')
    tip.classList.remove('on')
    hoverDot.setAttribute('opacity', '0')
  })

  // ── reveal ──
  const settle = (): void => {
    path.style.strokeDashoffset = '0'
    area.classList.add('on')
    laneEls.forEach((l) => {
      l.bar.setAttribute('width', String(l.w))
      l.count.classList.add('on')
    })
    noteEls.forEach((n) => n.classList.add('on'))
  }

  if (reduced) {
    settle()
    return
  }

  const len = path.getTotalLength()
  path.style.strokeDasharray = String(len)
  path.style.strokeDashoffset = String(len)

  const play = (): void => {
    const DUR = 5200
    const PAUSE = 950
    const stopAt = stops.map((s) => s.i / (N - 1))
    const shown = new Set<number>()
    const start = performance.now()
    let paused = 0
    let until = 0

    const tick = (t: number): void => {
      if (t < until) {
        requestAnimationFrame(tick)
        return
      }
      const p = Math.min(1, (t - start - paused) / DUR)

      for (let k = 0; k < stopAt.length; k++) {
        if (!shown.has(k) && p >= stopAt[k]) {
          shown.add(k)
          noteEls[k].classList.add('on')
          until = t + PAUSE
          paused += PAUSE
          break
        }
      }

      path.style.strokeDashoffset = String(len * (1 - p))
      const pt = path.getPointAtLength(len * p)
      head.setAttribute('cx', String(pt.x))
      head.setAttribute('cy', String(pt.y))

      const px = PAD_L + p * (W - PAD_L - PAD_R)
      laneEls.forEach((l) => {
        const w = Math.max(0, Math.min(l.w, px - l.x0))
        l.bar.setAttribute('width', String(w))
        if (w >= l.w - 0.5) l.count.classList.add('on')
      })

      if (p < 1) requestAnimationFrame(tick)
      else area.classList.add('on')
    }
    requestAnimationFrame(tick)
  }

  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return
      io.disconnect()
      play()
    },
    { threshold: 0.25 }
  )
  io.observe(svg)
}
