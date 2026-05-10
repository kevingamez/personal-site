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
  /**
   * Optional photo for the Google-Photos-style thumbnail pin. Drop the file
   * at `public/travel/<slug>.jpg` (any size, square crop renders best) and
   * point this at `/travel/<slug>.jpg`. If missing, the marker falls back to
   * a labelled dot.
   */
  photo?: string
  /** Optional alt text / lightbox caption when `photo` is set. */
  photoAlt?: string
}

// Replace / extend with your own. Order doesn't matter (sorted at render time).
export const travel: TravelPoint[] = [
  // ─── Colombia ────────────────────────────────────────────────
  // Verified against DIVIPOLA / Wikipedia. Localities (Ciudad Bolívar,
  // Aguablanca, El Paraíso) and unverified place names (Cachival, Candilejas)
  // were dropped or rolled up into their parent municipio.
  {
    city: 'Bogotá',
    country: 'Colombia',
    countryCode: 'CO',
    lat: 4.711,
    lng: -74.0721,
    weight: 100,
    firstYear: 2001,
    photo: '/travel/bogota.jpg',
  },
  {
    city: 'Medellín',
    country: 'Colombia',
    countryCode: 'CO',
    lat: 6.2476,
    lng: -75.5658,
    weight: 40,
    photo: '/travel/medellin.jpg',
  },
  {
    city: 'Cali',
    country: 'Colombia',
    countryCode: 'CO',
    lat: 3.4516,
    lng: -76.5320,
    weight: 25,
    photo: '/travel/cali.jpg',
  },
  {
    city: 'Cajicá',
    country: 'Colombia',
    countryCode: 'CO',
    lat: 4.9176,
    lng: -74.0258,
    weight: 22,
    photo: '/travel/cajica.jpg',
  },
  {
    city: 'Guatape',
    country: 'Colombia',
    countryCode: 'CO',
    lat: 6.2333,
    lng: -75.15,
    weight: 22,
    photo: '/travel/guatape.jpg',
  },
  {
    city: 'Guateque',
    country: 'Colombia',
    countryCode: 'CO',
    lat: 5.0064,
    lng: -73.4783,
    weight: 18,
    photo: '/travel/guateque.jpg',
  },
  {
    city: 'Salento',
    country: 'Colombia',
    countryCode: 'CO',
    lat: 4.6376,
    lng: -75.5707,
    weight: 20,
    photo: '/travel/salento.jpg',
  },
  {
    city: 'Doradal',
    country: 'Colombia',
    countryCode: 'CO',
    lat: 5.7444,
    lng: -74.6981,
    weight: 18,
    photo: '/travel/doradal.jpg',
  },
  {
    city: 'Tunja',
    country: 'Colombia',
    countryCode: 'CO',
    lat: 5.5353,
    lng: -73.3678,
    weight: 16,
    photo: '/travel/tunja.jpg',
  },
  {
    city: 'Guadalajara de Buga',
    country: 'Colombia',
    countryCode: 'CO',
    lat: 3.9012,
    lng: -76.2978,
    weight: 18,
    photo: '/travel/guadalajara-de-buga.jpg',
  },
  {
    city: 'Los Patios',
    country: 'Colombia',
    countryCode: 'CO',
    lat: 7.836,
    lng: -72.51,
    weight: 16,
    photo: '/travel/los-patios.jpg',
  },
  {
    city: 'Cachipay',
    country: 'Colombia',
    countryCode: 'CO',
    lat: 4.7333,
    lng: -74.4333,
    weight: 12,
    photo: '/travel/cachipay.jpg',
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
    photo: '/travel/new-york.jpg',
  },
  {
    city: 'Jersey City',
    country: 'United States',
    countryCode: 'US',
    lat: 40.7178,
    lng: -74.0431,
    weight: 25,
    photo: '/travel/jersey-city.jpg',
  },
  {
    city: 'Los Angeles',
    country: 'United States',
    countryCode: 'US',
    lat: 34.0522,
    lng: -118.2437,
    weight: 35,
    photo: '/travel/los-angeles.jpg',
  },
  {
    city: 'West Hollywood',
    country: 'United States',
    countryCode: 'US',
    lat: 34.09,
    lng: -118.3617,
    weight: 22,
    photo: '/travel/west-hollywood.jpg',
  },
  {
    city: 'Niagara Falls',
    country: 'United States',
    countryCode: 'US',
    lat: 43.0962,
    lng: -79.0377,
    weight: 18,
    photo: '/travel/niagara-falls.jpg',
  },

  // ─── Canada ──────────────────────────────────────────────────
  {
    city: 'Toronto',
    country: 'Canada',
    countryCode: 'CA',
    lat: 43.6532,
    lng: -79.3832,
    weight: 30,
    photo: '/travel/toronto.jpg',
  },
  {
    city: 'Mississauga',
    country: 'Canada',
    countryCode: 'CA',
    lat: 43.589,
    lng: -79.6441,
    weight: 22,
    photo: '/travel/mississauga.jpg',
  },
  {
    city: 'St. Catharines',
    country: 'Canada',
    countryCode: 'CA',
    lat: 43.1594,
    lng: -79.2469,
    weight: 16,
    photo: '/travel/st-catharines.jpg',
  },

  // ─── Denmark (extended stay) ─────────────────────────────────
  {
    city: 'Copenhagen',
    country: 'Denmark',
    countryCode: 'DK',
    lat: 55.6761,
    lng: 12.5683,
    weight: 50,
    photo: '/travel/copenhagen.jpg',
  },
  {
    city: 'Brøndby',
    country: 'Denmark',
    countryCode: 'DK',
    lat: 55.6478,
    lng: 12.4115,
    weight: 28,
    photo: '/travel/brondby.jpg',
  },
  {
    city: 'Brøndby Strand',
    country: 'Denmark',
    countryCode: 'DK',
    lat: 55.6261,
    lng: 12.4108,
    weight: 28,
    photo: '/travel/brondby-strand.jpg',
  },
  {
    city: 'Hedehusene',
    country: 'Denmark',
    countryCode: 'DK',
    lat: 55.6536,
    lng: 12.1958,
    weight: 22,
    photo: '/travel/hedehusene.jpg',
  },
  {
    city: 'Hvidovre',
    country: 'Denmark',
    countryCode: 'DK',
    lat: 55.657,
    lng: 12.4733,
    weight: 22,
    photo: '/travel/hvidovre.jpg',
  },
  {
    city: 'Roskilde',
    country: 'Denmark',
    countryCode: 'DK',
    lat: 55.6415,
    lng: 12.0803,
    weight: 20,
    photo: '/travel/roskilde.jpg',
  },
  {
    city: 'Helsingør',
    country: 'Denmark',
    countryCode: 'DK',
    lat: 56.0361,
    lng: 12.6136,
    weight: 18,
    photo: '/travel/helsingor.jpg',
  },
  {
    city: 'Kongens Lyngby',
    country: 'Denmark',
    countryCode: 'DK',
    lat: 55.7704,
    lng: 12.5039,
    weight: 18,
    photo: '/travel/kongens-lyngby.jpg',
  },
  {
    city: 'Klampenborg',
    country: 'Denmark',
    countryCode: 'DK',
    lat: 55.7694,
    lng: 12.5953,
    weight: 16,
    photo: '/travel/klampenborg.jpg',
  },

  // ─── United Kingdom ──────────────────────────────────────────
  {
    city: 'London',
    country: 'United Kingdom',
    countryCode: 'GB',
    lat: 51.5074,
    lng: -0.1278,
    weight: 28,
    photo: '/travel/london.jpg',
  },
  {
    city: 'Beckenham',
    country: 'United Kingdom',
    countryCode: 'GB',
    lat: 51.4081,
    lng: -0.0252,
    weight: 16,
    photo: '/travel/beckenham.jpg',
  },
  {
    city: 'Edinburgh',
    country: 'United Kingdom',
    countryCode: 'GB',
    lat: 55.9533,
    lng: -3.1883,
    weight: 18,
    photo: '/travel/edinburgh.jpg',
  },

  // ─── France ──────────────────────────────────────────────────
  {
    city: 'Paris',
    country: 'France',
    countryCode: 'FR',
    lat: 48.8566,
    lng: 2.3522,
    weight: 30,
    photo: '/travel/paris.jpg',
  },
  {
    city: 'Versailles',
    country: 'France',
    countryCode: 'FR',
    lat: 48.8014,
    lng: 2.1301,
    weight: 16,
    photo: '/travel/versailles.jpg',
  },
  {
    city: 'Gennevilliers',
    country: 'France',
    countryCode: 'FR',
    lat: 48.9335,
    lng: 2.294,
    weight: 14,
    photo: '/travel/gennevilliers.jpg',
  },

  // ─── Italy + Vatican ─────────────────────────────────────────
  {
    city: 'Rome',
    country: 'Italy',
    countryCode: 'IT',
    lat: 41.9028,
    lng: 12.4964,
    weight: 22,
    photo: '/travel/rome.jpg',
  },
  {
    city: 'Vatican City',
    country: 'Vatican City',
    countryCode: 'VA',
    lat: 41.9029,
    lng: 12.4534,
    weight: 16,
    photo: '/travel/vatican-city.jpg',
  },
  {
    city: 'Venice',
    country: 'Italy',
    countryCode: 'IT',
    lat: 45.4408,
    lng: 12.3155,
    weight: 18,
    photo: '/travel/venice.jpg',
  },

  // ─── Germany ─────────────────────────────────────────────────
  {
    city: 'Berlin',
    country: 'Germany',
    countryCode: 'DE',
    lat: 52.52,
    lng: 13.405,
    weight: 22,
    photo: '/travel/berlin.jpg',
  },
  {
    city: 'Hamburg',
    country: 'Germany',
    countryCode: 'DE',
    lat: 53.5511,
    lng: 9.9937,
    weight: 18,
    photo: '/travel/hamburg.jpg',
  },

  // ─── Czechia / Hungary / Türkiye ─────────────────────────────
  {
    city: 'Prague',
    country: 'Czechia',
    countryCode: 'CZ',
    lat: 50.0755,
    lng: 14.4378,
    weight: 18,
    photo: '/travel/prague.jpg',
  },
  {
    city: 'Budapest',
    country: 'Hungary',
    countryCode: 'HU',
    lat: 47.4979,
    lng: 19.0402,
    weight: 18,
    photo: '/travel/budapest.jpg',
  },
  {
    city: 'Istanbul',
    country: 'Türkiye',
    countryCode: 'TR',
    lat: 41.0082,
    lng: 28.9784,
    weight: 18,
    photo: '/travel/istanbul.jpg',
  },
]
