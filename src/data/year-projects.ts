// What was in active development, week by week, behind the contribution curve.
//
// These are Kevin's own commits in the Enttor codebases. Those repos are
// private, so the ranges are recorded here as static data rather than fetched:
// the numbers come from `git log --author` on each repo and are only accurate
// as of `capturedAt`.
//
// `commits` counts only what falls inside the contribution window the chart
// draws (the trailing 12 months), so the number beside a bar always matches the
// span drawn next to it. `startedBefore` marks a project that was already
// running when the window opens, so the figure never claims it "begins" at the
// left edge.

export type YearProject = {
  label: string
  from: string // ISO date of the first commit of his, real, not clamped
  to: string // ISO date of the last
  commits: number // his own commits inside the chart window
  startedBefore?: boolean
}

export const yearProjectsCapturedAt = '2026-08-12'

export const yearProjects: YearProject[] = [
  {
    label: 'Enttor Platform',
    from: '2024-05-30',
    to: '2026-05-20',
    commits: 673,
    startedBefore: true,
  },
  {
    label: 'Browser Infra',
    from: '2025-06-09',
    to: '2026-02-05',
    commits: 34,
    startedBefore: true,
  },
  { label: 'AI Ad Studio', from: '2026-01-27', to: '2026-07-16', commits: 1564 },
  { label: 'LinkedIn MCP', from: '2026-01-27', to: '2026-02-22', commits: 36 },
  { label: 'MakeMotionGraphics', from: '2026-02-01', to: '2026-05-21', commits: 296 },
  { label: 'AdsUploads', from: '2026-04-12', to: '2026-05-21', commits: 94 },
  { label: 'LinkedIn Editor', from: '2026-04-12', to: '2026-05-21', commits: 157 },
]
