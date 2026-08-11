// Strava "movement" section. Fetches the year snapshot from /api/strava and
// renders the hero totals, a "longest effort per sport" card grid (each with a
// Mapbox map), and the metric tiles - counting numbers up on scroll-in. Fails
// silent: if the endpoint isn't routed / no data, the section stays hidden.
// Barrel: implementation lives in strava-types / strava-units / strava-map /
// strava-render / strava-init.

export { initStrava } from './strava-init'
