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
