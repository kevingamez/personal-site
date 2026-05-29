// Editorial cartography map style for the wanderings Google Map. Extracted
// from wanderings.ts to keep that module under the 300-line cap.

// Dark "Google Photos travel timeline" style. This is the closest free
// approximation to the proprietary internal style - deep navy ocean, muted
// teal land, slightly different desert tone, white labels.
// Reference: https://mapstyle.withgoogle.com (using "Aubergine" as base then
// hand-tuned the colors to match the reference screenshots).
// Editorial cartography style — keeps Google's terrain shading, road network
// and points of interest, but warms the palette toward the cream + coral
// brand. Inspired by National Geographic prints and the Google Photos travel
// timeline (which is dark, but warm). Land tiers go from sage-cream
// (lowlands) → soft amber (deserts/highlands), water is pacific blue, roads
// are muted off-white so they read as context, not noise.
export const mapStyle: google.maps.MapTypeStyle[] = [
  // Base label colors (overridden per feature below).
  { elementType: 'labels.text.fill', stylers: [{ color: '#3a352f' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#faf7f0' }, { weight: 2 }] },

  // Country: clear sepia border + dark name, this is the strongest tier.
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#8b6f55' }, { weight: 0.9 }],
  },
  {
    featureType: 'administrative.country',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#1f1d1a' }, { weight: 700 }],
  },

  // Province / state: thinner sepia border, mid-tone label.
  {
    featureType: 'administrative.province',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#a08770' }, { weight: 0.4 }],
  },
  {
    featureType: 'administrative.province',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#3a352f' }],
  },

  // City names: visible at all zoom levels with a strong cream halo so they
  // pop on top of the heatmap blooms.
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#1f1d1a' }],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#faf7f0' }, { weight: 3 }],
  },
  {
    featureType: 'administrative.neighborhood',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b6660' }],
  },

  // Landscape — keep the terrain shading enabled (mapTypeId: 'terrain' adds
  // hillshade automatically); we just tint the geometry layers.
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#f3ede2' }] },
  {
    featureType: 'landscape.natural.terrain',
    elementType: 'geometry',
    stylers: [{ color: '#e8d9c1' }],
  },
  {
    featureType: 'landscape.natural.landcover',
    elementType: 'geometry',
    stylers: [{ color: '#dbe6d4' }],
  },
  { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: '#ebe3d4' }] },

  // Parks / natural features — subtle sage so they read as parks, not roads.
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#c5d8b8' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#4a6a3a' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#faf7f0' }, { weight: 2 }],
  },

  // Other POIs (restaurants, shops, etc.) — muted, only visible far in.
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.medical', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.school', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.sports_complex', stylers: [{ visibility: 'off' }] },
  {
    featureType: 'poi.attraction',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#a14a2a' }],
  },
  { featureType: 'poi.attraction', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },

  // Roads — visible but quiet. Highways slightly darker, locals barely there.
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }, { weight: 0.6 }],
  },
  { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'road.local', stylers: [{ visibility: 'simplified' }] },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#f0d090' }, { weight: 1.2 }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b5030' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }],
  },

  // Transit — keep rail lines (nice for travel context) but hide stations.
  { featureType: 'transit.station', stylers: [{ visibility: 'off' }] },
  {
    featureType: 'transit.line',
    elementType: 'geometry',
    stylers: [{ color: '#c2a085' }, { weight: 0.5 }],
  },

  // Water — pacific blue with depth gradient, soft cream label halo.
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#a8c6d8' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#3a5570' }, { weight: 500 }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#a8c6d8' }, { weight: 2 }],
  },
]
