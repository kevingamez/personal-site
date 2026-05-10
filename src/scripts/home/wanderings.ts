// Wanderings map: Google Maps JS API + visualization HeatmapLayer.
// Picked Google over OpenFreeMap/Mapbox because the design reference IS
// Google Photos' travel timeline - using Google's own tile servers gives us
// the exact same continent shapes, label fonts, ocean glow and biome shading.
//
// Loaded only when the section enters the viewport (lazy import + lazy
// loader.importLibrary) so the home-page TTI isn't dragged by the ~150KB
// loader + tile bundle.
//
// API key is HTTP-referrer-restricted in Google Cloud Console - safe to embed
// client-side. Set PUBLIC_GOOGLE_MAPS_API_KEY in .env.

type TravelPoint = {
  city: string
  country: string
  countryCode: string
  lat: number
  lng: number
  weight: number
  firstYear?: number
}

const REDUCE_MOTION =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

let mounted = false

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
const mapStyle: google.maps.MapTypeStyle[] = [
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
  { featureType: 'administrative.neighborhood', elementType: 'labels.text.fill', stylers: [{ color: '#6b6660' }] },

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

async function mountMap(
  container: HTMLElement,
  points: TravelPoint[],
  apiKey: string
): Promise<void> {
  if (mounted) return
  mounted = true

  if (!apiKey) {
    container.classList.add('map-fallback')
    container.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:rgba(241,238,231,0.5);font-size:14px;letter-spacing:0.04em">Set PUBLIC_GOOGLE_MAPS_API_KEY to render the travel map</div>'
    return
  }

  const { setOptions, importLibrary } = await import('@googlemaps/js-api-loader')
  setOptions({ key: apiKey, v: 'weekly' })

  const [{ Map: GMap }, vis] = await Promise.all([
    importLibrary('maps') as Promise<google.maps.MapsLibrary>,
    importLibrary('visualization') as Promise<google.maps.VisualizationLibrary>,
  ])

  // Center on density-weighted centroid so the user lands on the busiest area.
  const totalW = points.reduce((a, p) => a + p.weight, 0) || 1
  const cLng = points.reduce((a, p) => a + p.lng * p.weight, 0) / totalW
  const cLat = points.reduce((a, p) => a + p.lat * p.weight, 0) / totalW

  const map = new GMap(container, {
    center: { lat: cLat, lng: cLng },
    zoom: 2,
    minZoom: 2,
    maxZoom: 14,
    backgroundColor: '#0d2040',
    disableDefaultUI: true,
    zoomControl: true,
    zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
    keyboardShortcuts: false,
    gestureHandling: 'greedy',
    clickableIcons: false,
    styles: mapStyle,
  })

  // Build heatmap data - weight scales bloom intensity per city.
  const heatmapData = points.map((p) => ({
    location: new google.maps.LatLng(p.lat, p.lng),
    weight: Math.max(1, p.weight),
  }))

  // Coral / pink / orange gradient to match the brand palette and the
  // purple→coral→hot blooms in the reference screenshots.
  const gradient = [
    'rgba(0, 0, 0, 0)',
    'rgba(122, 60, 168, 0.55)',
    'rgba(168, 60, 140, 0.7)',
    'rgba(196, 80, 122, 0.8)',
    'rgba(217, 105, 68, 0.9)', // brand coral
    'rgba(255, 138, 85, 0.95)',
    'rgba(255, 200, 120, 1)',
  ]

  new vis.HeatmapLayer({
    map,
    data: heatmapData,
    radius: 35,
    opacity: 0.78,
    gradient,
    dissipating: true,
  })

  // Drop a small dot + visible label per city. Labels appear from zoom 4 up
  // (continent → country → city), so the heatmap stays clean at world view
  // and city names show up the moment you zoom in.
  const labelMarkers = points.map((p) => {
    const m = new google.maps.Marker({
      position: { lat: p.lat, lng: p.lng },
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 3,
        fillColor: '#ffffff',
        fillOpacity: 0.9,
        strokeColor: '#0d2040',
        strokeWeight: 1.5,
      },
      label: {
        text: p.city,
        color: '#ffffff',
        fontSize: '11px',
        fontWeight: '600',
        className: 'wanderings-marker-label',
      },
      title: `${p.city}, ${p.country}`,
      optimized: false,
      visible: false,
      zIndex: 5,
    })
    m.setMap(map)
    return m
  })

  const updateLabelVisibility = (): void => {
    const z = map.getZoom() ?? 2
    const show = z >= 4
    for (const m of labelMarkers) m.setVisible(show)
  }
  updateLabelVisibility()
  map.addListener('zoom_changed', updateLabelVisibility)

  if (!REDUCE_MOTION) {
    // Subtle ambient zoom-in on first paint (Google Photos opens this way).
    setTimeout(() => {
      const z = map.getZoom() ?? 2
      map.setZoom(Math.min(z + 0.5, 4))
    }, 600)
  }
}

export function initWanderings(): void {
  const container = document.getElementById('travel-map')
  if (!container || !(container instanceof HTMLElement)) return
  let points: TravelPoint[] = []
  try {
    points = JSON.parse(container.dataset.travel || '[]') as TravelPoint[]
  } catch {
    return
  }
  if (!points.length) return
  const apiKey = container.dataset.gmapsKey || ''

  if (typeof IntersectionObserver === 'undefined') {
    void mountMap(container, points, apiKey)
    return
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          void mountMap(container, points, apiKey)
          io.disconnect()
          break
        }
      }
    },
    { rootMargin: '300px 0px' }
  )
  io.observe(container)
}
