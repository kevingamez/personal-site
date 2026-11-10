// Mapbox Static image helper for the longest-effort route maps.

// Mapbox Static map for a route. Public token, light style, ink path. 640x400
// @2x = 1280x800 (Mapbox max); 16:10 matches the card so it never crops.
export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
// The latest-activity block draws smaller, so it asks for a smaller image
// (same 16:10) with a thinner path and less padding.
export function mapboxUrl(polyline: string, compact = false): string {
  const path = `path-${compact ? 4 : 6}+1f1d1a-0.9(${encodeURIComponent(polyline)})`
  const size = compact ? '400x250' : '640x400'
  return `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/${path}/auto/${size}@2x?access_token=${MAPBOX_TOKEN}&padding=${compact ? 22 : 34}`
}
