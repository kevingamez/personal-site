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
const mapStyle: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#3d6864' }] }, // muted teal land
  { elementType: 'labels.text.fill', stylers: [{ color: '#e8eef7' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0d2040' }, { weight: 2 }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#ffffff' }, { weight: 0.4 }, { visibility: 'on' }],
  },
  {
    featureType: 'administrative.country',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'administrative.province',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#ffffff' }, { weight: 0.2 }],
  },
  { featureType: 'administrative.locality', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.neighborhood', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', stylers: [{ visibility: 'off' }] },
  // Landscape (forests, parks, deserts)
  { featureType: 'landscape.natural.terrain', elementType: 'geometry', stylers: [{ color: '#5a5b6e' }] },
  { featureType: 'landscape.natural.landcover', elementType: 'geometry', stylers: [{ color: '#3d6864' }] },
  { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: '#3d6864' }] },
  // Water
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d2040' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#8cafd7' }] },
  { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#0d2040' }, { weight: 1.5 }] },
]

async function mountMap(container: HTMLElement, points: TravelPoint[], apiKey: string): Promise<void> {
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
    maxZoom: 8,
    backgroundColor: '#0d2040',
    disableDefaultUI: true,
    zoomControl: false,
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
    opacity: 0.85,
    gradient,
    dissipating: true,
  })

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
