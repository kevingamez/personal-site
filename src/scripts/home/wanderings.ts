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
  photo?: string
  photoAlt?: string
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
    maxZoom: 16,
    backgroundColor: '#a8c6d8',
    mapTypeId: 'terrain',
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

  // Photo-thumbnail pins, Google-Photos style. We avoid AdvancedMarkerElement
  // because that path requires a Cloud-side `mapId` (which would also disable
  // our inline `styles` array). Instead we drop a custom `OverlayView` per
  // point — rendered as plain DOM, projected to the map's pixel coords on
  // every draw, which keeps both the editorial style and the HTML thumbnails.
  const lightbox = ensureLightbox()

  const buildPin = (p: TravelPoint): HTMLElement => {
    const wrap = document.createElement('button')
    wrap.type = 'button'
    wrap.className = p.photo ? 'wp-pin wp-pin-photo' : 'wp-pin wp-pin-dot'
    wrap.title = `${p.city}, ${p.country}`
    wrap.setAttribute('aria-label', `${p.city}, ${p.country}`)
    if (p.photo) {
      const img = document.createElement('img')
      img.src = p.photo
      img.alt = p.photoAlt || `${p.city}, ${p.country}`
      img.loading = 'lazy'
      img.decoding = 'async'
      img.draggable = false
      // If the photo 404s, swap to the dot variant gracefully.
      img.addEventListener('error', () => {
        wrap.classList.remove('wp-pin-photo')
        wrap.classList.add('wp-pin-dot')
        img.remove()
      })
      wrap.appendChild(img)
    }
    const cap = document.createElement('span')
    cap.className = 'wp-pin-cap'
    cap.textContent = p.city
    wrap.appendChild(cap)
    wrap.addEventListener('click', (e) => {
      e.stopPropagation()
      if (p.photo) lightbox.open(p)
    })
    return wrap
  }

  class PhotoOverlay extends google.maps.OverlayView {
    private latLng: google.maps.LatLng
    private root: HTMLElement | null = null
    constructor(
      private content: HTMLElement,
      lat: number,
      lng: number
    ) {
      super()
      this.latLng = new google.maps.LatLng(lat, lng)
    }
    onAdd(): void {
      const root = document.createElement('div')
      root.className = 'wp-pin-anchor'
      root.appendChild(this.content)
      const panes = this.getPanes()
      if (panes) panes.overlayMouseTarget.appendChild(root)
      this.root = root
    }
    draw(): void {
      const proj = this.getProjection()
      if (!proj || !this.root) return
      const px = proj.fromLatLngToDivPixel(this.latLng)
      if (!px) return
      this.root.style.left = `${px.x}px`
      this.root.style.top = `${px.y}px`
    }
    onRemove(): void {
      if (this.root?.parentNode) this.root.parentNode.removeChild(this.root)
      this.root = null
    }
    getContent(): HTMLElement {
      return this.content
    }
  }

  const pins = points.map((p) => {
    const content = buildPin(p)
    const overlay = new PhotoOverlay(content, p.lat, p.lng)
    overlay.setMap(map)
    return { content, hasPhoto: !!p.photo }
  })

  // Pin visibility tiers (so the world view doesn't feel empty):
  //   z ≥ 2 (always): a small dot at every city — confirms the map is alive.
  //   z ≥ 4 (continent): show the city caption alongside the dot.
  //   z ≥ 6 (country/region): photo pins go full-size (48×48 with caption).
  //   2-5  with a photo: photo renders as a tiny mini thumbnail (26×26).
  const updatePinVisibility = (): void => {
    const z = map.getZoom() ?? 2
    const showCaption = z >= 4
    const fullPhoto = z >= 6
    for (const { content, hasPhoto } of pins) {
      content.classList.add('on')
      content.classList.toggle('show-cap', showCaption)
      if (hasPhoto) content.classList.toggle('mini', !fullPhoto)
    }
  }
  updatePinVisibility()
  map.addListener('zoom_changed', updatePinVisibility)

  if (!REDUCE_MOTION) {
    // Subtle ambient zoom-in on first paint (Google Photos opens this way).
    setTimeout(() => {
      const z = map.getZoom() ?? 2
      map.setZoom(Math.min(z + 0.5, 4))
    }, 600)
  }
}

interface Lightbox {
  open: (p: TravelPoint) => void
  close: () => void
}

let lightboxSingleton: Lightbox | null = null

function ensureLightbox(): Lightbox {
  if (lightboxSingleton) return lightboxSingleton
  const root = document.createElement('div')
  root.className = 'wp-lightbox'
  root.setAttribute('role', 'dialog')
  root.setAttribute('aria-modal', 'true')
  root.setAttribute('aria-label', 'Travel photo')
  root.innerHTML = `
    <div class="wp-lb-backdrop" data-close></div>
    <button class="wp-lb-close" type="button" aria-label="Close" data-close>×</button>
    <figure class="wp-lb-figure">
      <img class="wp-lb-img" alt="" />
      <figcaption class="wp-lb-caption">
        <span class="wp-lb-city"></span>
        <span class="wp-lb-country"></span>
      </figcaption>
    </figure>
  `
  document.body.appendChild(root)

  const img = root.querySelector<HTMLImageElement>('.wp-lb-img')!
  const cityEl = root.querySelector<HTMLElement>('.wp-lb-city')!
  const countryEl = root.querySelector<HTMLElement>('.wp-lb-country')!

  const close = (): void => {
    root.classList.remove('on')
    document.body.classList.remove('wp-lock')
  }
  const open = (p: TravelPoint): void => {
    if (!p.photo) return
    img.src = p.photo
    img.alt = p.photoAlt || `${p.city}, ${p.country}`
    cityEl.textContent = p.city
    countryEl.textContent = p.country
    root.classList.add('on')
    document.body.classList.add('wp-lock')
  }
  root.addEventListener('click', (e) => {
    const t = e.target as HTMLElement
    if (t.dataset.close !== undefined) close()
  })
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && root.classList.contains('on')) close()
  })

  lightboxSingleton = { open, close }
  return lightboxSingleton
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
