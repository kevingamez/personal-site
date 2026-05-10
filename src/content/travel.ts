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
  // ─── Colombia ────────────────────────────────────────────────
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
    weight: 40,
  },
  {
    city: 'Ciudad Bolívar',
    country: 'Colombia',
    countryCode: 'CO',
    lat: 4.4929,
    lng: -74.1576,
    weight: 25,
  },
  {
    city: 'El Paraíso',
    country: 'Colombia',
    countryCode: 'CO',
    lat: 4.5601,
    lng: -74.1305,
    weight: 18,
  },
  {
    city: 'Aguablanca',
    country: 'Colombia',
    countryCode: 'CO',
    lat: 3.4516,
    lng: -76.521,
    weight: 18,
  },
  {
    city: 'Cajicá',
    country: 'Colombia',
    countryCode: 'CO',
    lat: 4.9176,
    lng: -74.0258,
    weight: 22,
  },
  {
    city: 'Guatape',
    country: 'Colombia',
    countryCode: 'CO',
    lat: 6.2333,
    lng: -75.15,
    weight: 22,
  },
  {
    city: 'Guateque',
    country: 'Colombia',
    countryCode: 'CO',
    lat: 5.0064,
    lng: -73.4783,
    weight: 18,
  },
  {
    city: 'Salento',
    country: 'Colombia',
    countryCode: 'CO',
    lat: 4.6376,
    lng: -75.5707,
    weight: 20,
  },
  {
    city: 'Doradal',
    country: 'Colombia',
    countryCode: 'CO',
    lat: 5.7444,
    lng: -74.6981,
    weight: 18,
  },
  {
    city: 'Puente de Boyacá',
    country: 'Colombia',
    countryCode: 'CO',
    lat: 5.4541,
    lng: -73.4639,
    weight: 15,
  },
  {
    city: 'Guadalajara de Buga',
    country: 'Colombia',
    countryCode: 'CO',
    lat: 3.9012,
    lng: -76.2978,
    weight: 18,
  },
  {
    city: 'Los Patios',
    country: 'Colombia',
    countryCode: 'CO',
    lat: 7.836,
    lng: -72.51,
    weight: 16,
  },
  {
    city: 'Candilejas',
    country: 'Colombia',
    countryCode: 'CO',
    lat: 1.71,
    lng: -75.24,
    weight: 12,
  },
  {
    city: 'Cachipay',
    country: 'Colombia',
    countryCode: 'CO',
    lat: 4.7333,
    lng: -74.4333,
    weight: 12,
  },

  // ─── United States ───────────────────────────────────────────
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
    city: 'Jersey City',
    country: 'United States',
    countryCode: 'US',
    lat: 40.7178,
    lng: -74.0431,
    weight: 25,
  },
  {
    city: 'Los Angeles',
    country: 'United States',
    countryCode: 'US',
    lat: 34.0522,
    lng: -118.2437,
    weight: 35,
  },
  {
    city: 'West Hollywood',
    country: 'United States',
    countryCode: 'US',
    lat: 34.09,
    lng: -118.3617,
    weight: 22,
  },
  {
    city: 'Niagara Falls',
    country: 'United States',
    countryCode: 'US',
    lat: 43.0962,
    lng: -79.0377,
    weight: 18,
  },

  // ─── Canada ──────────────────────────────────────────────────
  {
    city: 'Toronto',
    country: 'Canada',
    countryCode: 'CA',
    lat: 43.6532,
    lng: -79.3832,
    weight: 30,
  },
  {
    city: 'Mississauga',
    country: 'Canada',
    countryCode: 'CA',
    lat: 43.589,
    lng: -79.6441,
    weight: 22,
  },
  {
    city: 'St. Catharines',
    country: 'Canada',
    countryCode: 'CA',
    lat: 43.1594,
    lng: -79.2469,
    weight: 16,
  },

  // ─── Denmark (extended stay) ─────────────────────────────────
  {
    city: 'Copenhagen',
    country: 'Denmark',
    countryCode: 'DK',
    lat: 55.6761,
    lng: 12.5683,
    weight: 50,
  },
  {
    city: 'Brøndby',
    country: 'Denmark',
    countryCode: 'DK',
    lat: 55.6478,
    lng: 12.4115,
    weight: 28,
  },
  {
    city: 'Brøndby Strand',
    country: 'Denmark',
    countryCode: 'DK',
    lat: 55.6261,
    lng: 12.4108,
    weight: 28,
  },
  {
    city: 'Hedehusene',
    country: 'Denmark',
    countryCode: 'DK',
    lat: 55.6536,
    lng: 12.1958,
    weight: 22,
  },
  {
    city: 'Hvidovre',
    country: 'Denmark',
    countryCode: 'DK',
    lat: 55.657,
    lng: 12.4733,
    weight: 22,
  },
  {
    city: 'Roskilde',
    country: 'Denmark',
    countryCode: 'DK',
    lat: 55.6415,
    lng: 12.0803,
    weight: 20,
  },
  {
    city: 'Helsingør',
    country: 'Denmark',
    countryCode: 'DK',
    lat: 56.0361,
    lng: 12.6136,
    weight: 18,
  },
  {
    city: 'Kongens Lyngby',
    country: 'Denmark',
    countryCode: 'DK',
    lat: 55.7704,
    lng: 12.5039,
    weight: 18,
  },
  {
    city: 'Klampenborg',
    country: 'Denmark',
    countryCode: 'DK',
    lat: 55.7694,
    lng: 12.5953,
    weight: 16,
  },

  // ─── United Kingdom ──────────────────────────────────────────
  {
    city: 'London',
    country: 'United Kingdom',
    countryCode: 'GB',
    lat: 51.5074,
    lng: -0.1278,
    weight: 28,
  },
  {
    city: 'Beckenham',
    country: 'United Kingdom',
    countryCode: 'GB',
    lat: 51.4081,
    lng: -0.0252,
    weight: 16,
  },
  {
    city: 'Edinburgh',
    country: 'United Kingdom',
    countryCode: 'GB',
    lat: 55.9533,
    lng: -3.1883,
    weight: 18,
  },

  // ─── France ──────────────────────────────────────────────────
  {
    city: 'Paris',
    country: 'France',
    countryCode: 'FR',
    lat: 48.8566,
    lng: 2.3522,
    weight: 30,
  },
  {
    city: 'Versailles',
    country: 'France',
    countryCode: 'FR',
    lat: 48.8014,
    lng: 2.1301,
    weight: 16,
  },
  {
    city: 'Gennevilliers',
    country: 'France',
    countryCode: 'FR',
    lat: 48.9335,
    lng: 2.294,
    weight: 14,
  },

  // ─── Italy + Vatican ─────────────────────────────────────────
  {
    city: 'Rome',
    country: 'Italy',
    countryCode: 'IT',
    lat: 41.9028,
    lng: 12.4964,
    weight: 22,
  },
  {
    city: 'Vatican City',
    country: 'Vatican City',
    countryCode: 'VA',
    lat: 41.9029,
    lng: 12.4534,
    weight: 16,
  },
  {
    city: 'Venice',
    country: 'Italy',
    countryCode: 'IT',
    lat: 45.4408,
    lng: 12.3155,
    weight: 18,
  },

  // ─── Germany ─────────────────────────────────────────────────
  {
    city: 'Berlin',
    country: 'Germany',
    countryCode: 'DE',
    lat: 52.52,
    lng: 13.405,
    weight: 22,
  },
  {
    city: 'Hamburg',
    country: 'Germany',
    countryCode: 'DE',
    lat: 53.5511,
    lng: 9.9937,
    weight: 18,
  },

  // ─── Czechia / Hungary / Türkiye ─────────────────────────────
  {
    city: 'Prague',
    country: 'Czechia',
    countryCode: 'CZ',
    lat: 50.0755,
    lng: 14.4378,
    weight: 18,
  },
  {
    city: 'Budapest',
    country: 'Hungary',
    countryCode: 'HU',
    lat: 47.4979,
    lng: 19.0402,
    weight: 18,
  },
  {
    city: 'Istanbul',
    country: 'Türkiye',
    countryCode: 'TR',
    lat: 41.0082,
    lng: 28.9784,
    weight: 18,
  },
]
