// Cities I've spent meaningful time in. Used by the Wanderings map on the home
// page - each entry becomes a heatmap point on a MapLibre vector map.
//
// `weight` controls the intensity of the heat bloom (more visits / longer
// stay = higher number). Weights are relative, not absolute; values 1–100 are
// fine. The heatmap layer normalizes them.

export type TravelPoint = {
  city: string
  country: string
  countryCode: string // ISO 3166-1 alpha-2
  lat: number
  lng: number
  weight: number
  firstYear?: number // optional, used for the "since YYYY" stat
}

// Replace / extend with your own. Order doesn't matter (sorted at render time).
export const travel: TravelPoint[] = [
  // Home base
  {
    city: 'Bogotá',
    country: 'Colombia',
    countryCode: 'CO',
    lat: 4.711,
    lng: -74.0721,
    weight: 100,
    firstYear: 2001,
  },
  {
    city: 'Medellín',
    country: 'Colombia',
    countryCode: 'CO',
    lat: 6.2476,
    lng: -75.5658,
    weight: 35,
  },
  {
    city: 'Cartagena',
    country: 'Colombia',
    countryCode: 'CO',
    lat: 10.391,
    lng: -75.4794,
    weight: 25,
  },

  // North America
  {
    city: 'New York',
    country: 'United States',
    countryCode: 'US',
    lat: 40.7128,
    lng: -74.006,
    weight: 60,
    firstYear: 2024,
  },
  {
    city: 'Los Angeles',
    country: 'United States',
    countryCode: 'US',
    lat: 34.0522,
    lng: -118.2437,
    weight: 30,
  },
  {
    city: 'San Francisco',
    country: 'United States',
    countryCode: 'US',
    lat: 37.7749,
    lng: -122.4194,
    weight: 20,
  },
  {
    city: 'Miami',
    country: 'United States',
    countryCode: 'US',
    lat: 25.7617,
    lng: -80.1918,
    weight: 25,
  },
  {
    city: 'Boston',
    country: 'United States',
    countryCode: 'US',
    lat: 42.3601,
    lng: -71.0589,
    weight: 15,
  },
  {
    city: 'Washington',
    country: 'United States',
    countryCode: 'US',
    lat: 38.9072,
    lng: -77.0369,
    weight: 12,
  },
  {
    city: 'Mexico City',
    country: 'Mexico',
    countryCode: 'MX',
    lat: 19.4326,
    lng: -99.1332,
    weight: 18,
  },

  // Europe
  { city: 'Madrid', country: 'Spain', countryCode: 'ES', lat: 40.4168, lng: -3.7038, weight: 30 },
  { city: 'Barcelona', country: 'Spain', countryCode: 'ES', lat: 41.3851, lng: 2.1734, weight: 25 },
  { city: 'Paris', country: 'France', countryCode: 'FR', lat: 48.8566, lng: 2.3522, weight: 25 },
  {
    city: 'London',
    country: 'United Kingdom',
    countryCode: 'GB',
    lat: 51.5074,
    lng: -0.1278,
    weight: 20,
  },
  { city: 'Berlin', country: 'Germany', countryCode: 'DE', lat: 52.52, lng: 13.405, weight: 18 },
  { city: 'Rome', country: 'Italy', countryCode: 'IT', lat: 41.9028, lng: 12.4964, weight: 15 },
  { city: 'Milan', country: 'Italy', countryCode: 'IT', lat: 45.4642, lng: 9.19, weight: 12 },
  {
    city: 'Lisbon',
    country: 'Portugal',
    countryCode: 'PT',
    lat: 38.7223,
    lng: -9.1393,
    weight: 12,
  },
  {
    city: 'Istanbul',
    country: 'Türkiye',
    countryCode: 'TR',
    lat: 41.0082,
    lng: 28.9784,
    weight: 15,
  },
]
