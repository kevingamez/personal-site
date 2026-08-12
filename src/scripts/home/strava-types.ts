// Data-shape interfaces for the /api/strava year-snapshot payload.

export interface Totals {
  distanceM: number
  movingTime: number
  elevationM: number
  count: number
  activeDays: number
}
export interface Effort {
  name: string
  startDate: string
  url: string
  distanceM: number
  elevationM: number
  avgSpeedMs: number
}
// Pre-projected route line from the server (strava-shape.ts extractRoute):
// points are already in a flat x/y space sized w by h, so the client only has
// to draw them.
export interface Route {
  points: number[][]
  w: number
  h: number
}
export interface Activity {
  name: string
  sportType: string
  distanceM: number
  movingTime: number
  elevationM: number
  avgSpeedMs: number
  startDate: string
  url: string
  polyline?: string | null
  route?: Route | null
}
export interface Insights {
  biggestWeekStart: string | null
  biggestWeekDistanceM: number
  busiestWeekday: number | null
  busiestWeekdayCount: number
  biggestClimb: Effort | null
  fastest: Effort | null
  eiffels: number
}
export interface Payload {
  configured: boolean
  error?: boolean
  totals: Totals | null
  longestBySport: Activity[]
  insights: Insights
}
