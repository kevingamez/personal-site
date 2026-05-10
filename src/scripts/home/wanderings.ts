// Wanderings map: MapLibre GL + OpenFreeMap dark-matter style + custom coral
// heatmap layer driven by points from src/content/travel.ts.
//
// OpenFreeMap is free OSM-derived vector tiles, no API key required:
//   https://openfreemap.org
//
// Loaded only when the section enters the viewport (lazy import) so the home
// page Time-To-Interactive isn't dragged by the ~280KB MapLibre bundle.

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

async function mountMap(container: HTMLElement, points: TravelPoint[]): Promise<void> {
  if (mounted) return
  mounted = true

  const maplibre = await import('maplibre-gl')
  await import('maplibre-gl/dist/maplibre-gl.css')

  const features = points.map((p) => ({
    type: 'Feature' as const,
    geometry: { type: 'Point' as const, coordinates: [p.lng, p.lat] },
    properties: {
      city: p.city,
      country: p.country,
      weight: p.weight,
    },
  }))

  // Center the initial view on the densest cluster so the user lands on the
  // most-visited region first. Falls back to a zoomed-out world view.
  const totalWeight = points.reduce((a, p) => a + p.weight, 0) || 1
  const centerLng = points.reduce((a, p) => a + p.lng * p.weight, 0) / totalWeight
  const centerLat = points.reduce((a, p) => a + p.lat * p.weight, 0) / totalWeight

  const map = new maplibre.Map({
    container,
    // OpenFreeMap dark vector tiles. We recolor every layer below to match
    // the Google Photos travel-heatmap reference (deep navy ocean, teal land).
    style: 'https://tiles.openfreemap.org/styles/dark',
    center: [centerLng, centerLat],
    zoom: 1.4,
    minZoom: 0.8,
    maxZoom: 8,
    attributionControl: false, // hidden — we acknowledge in /humans.txt instead
    pitchWithRotate: false,
    dragRotate: false,
    touchPitch: false,
  })

  // Disable map rotation; we want a flat, calm experience.
  map.touchZoomRotate.disableRotation()

  map.on('load', () => {
    // Recolor the entire base map to match the Google-Photos reference:
    // deep navy ocean (#0a1c34), teal-green land (#1d4a3f → #2d6555 range),
    // pale labels, dashed-white country borders.
    const OCEAN = '#0a1c34'
    const LAND = '#1f4f44'
    const LAND_LIGHT = '#2d6553'
    const LAND_PARK = '#1a4438'
    const BORDER = 'rgba(255, 255, 255, 0.18)'
    const BORDER_BOLD = 'rgba(255, 255, 255, 0.28)'
    const TEXT_FILL = 'rgba(220, 230, 245, 0.92)'
    const TEXT_HALO = 'rgba(10, 28, 52, 0.85)'

    const style = map.getStyle()
    for (const layer of style.layers) {
      const id = layer.id
      const type = layer.type
      try {
        // Background / land / parks / landuse — paint teal-green
        if (id === 'background') {
          map.setPaintProperty(id, 'background-color', LAND)
        } else if (type === 'fill') {
          if (/water|ocean|sea|lake|river|stream/.test(id)) {
            map.setPaintProperty(id, 'fill-color', OCEAN)
          } else if (/park|wood|forest|grass|nature_reserve|cemetery|farmland/.test(id)) {
            map.setPaintProperty(id, 'fill-color', LAND_PARK)
          } else if (/sand|beach|desert|residential|industrial|landuse|landcover/.test(id)) {
            map.setPaintProperty(id, 'fill-color', LAND_LIGHT)
          } else if (/building/.test(id)) {
            map.setPaintProperty(id, 'fill-color', 'rgba(255,255,255,0.04)')
          }
        } else if (type === 'line') {
          if (/boundary|admin/.test(id)) {
            const isBold = /country|0|1/.test(id)
            map.setPaintProperty(id, 'line-color', isBold ? BORDER_BOLD : BORDER)
            map.setPaintProperty(id, 'line-width', isBold ? 0.7 : 0.4)
          } else if (/water|river|stream|coast/.test(id)) {
            map.setPaintProperty(id, 'line-color', OCEAN)
          } else if (/road|street|highway|motorway|transportation|tunnel|bridge/.test(id)) {
            // Hide all roads — too noisy for a heatmap context
            map.setLayoutProperty(id, 'visibility', 'none')
          } else if (/rail|aero|ferry|path|footway/.test(id)) {
            map.setLayoutProperty(id, 'visibility', 'none')
          }
        } else if (type === 'symbol') {
          // Labels — country/state/city only, hide POIs/streets
          if (/poi|housenumber|street|road|highway|transit/.test(id)) {
            map.setLayoutProperty(id, 'visibility', 'none')
          } else {
            map.setPaintProperty(id, 'text-color', TEXT_FILL)
            map.setPaintProperty(id, 'text-halo-color', TEXT_HALO)
            map.setPaintProperty(id, 'text-halo-width', 1.2)
          }
        }
      } catch {
        // Layer may not support that paint property — skip silently.
      }
    }

    // Heatmap source + layer
    map.addSource('travel', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features },
    })

    map.addLayer({
      id: 'travel-heat',
      type: 'heatmap',
      source: 'travel',
      maxzoom: 6,
      paint: {
        // Heat intensity scaled by the point's weight property
        'heatmap-weight': ['interpolate', ['linear'], ['get', 'weight'], 0, 0, 100, 1],
        // Density falloff scales with zoom so blooms stay readable when zoomed in
        'heatmap-intensity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0,
          1,
          6,
          3,
        ],
        // Coral palette — purple → coral → bright orange like the screenshot
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0,
          'rgba(0, 0, 0, 0)',
          0.2,
          'rgba(122, 60, 168, 0.6)', // soft purple at low density
          0.4,
          'rgba(196, 80, 122, 0.75)', // pink-coral
          0.6,
          'rgba(217, 105, 68, 0.85)', // coral (our brand)
          0.8,
          'rgba(255, 138, 85, 0.95)', // bright orange
          1,
          'rgba(255, 200, 120, 1)', // hot center
        ],
        // Bigger blooms at higher zooms
        'heatmap-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0,
          14,
          3,
          28,
          6,
          70,
        ],
        // Fade heatmap when zoomed in close (cities show as dots instead)
        'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 0, 0.85, 5, 0.9, 6, 0.5, 8, 0],
      },
    })

    // Crisp dot per city for closer zoom levels
    map.addLayer({
      id: 'travel-dots',
      type: 'circle',
      source: 'travel',
      minzoom: 4,
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 2, 8, 6],
        'circle-color': '#ffc878',
        'circle-stroke-color': '#d96944',
        'circle-stroke-width': 1.5,
        'circle-opacity': ['interpolate', ['linear'], ['zoom'], 4, 0, 5.5, 1],
      },
    })

    // Tooltip on hover (city — country)
    const popup = new maplibre.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 10,
      className: 'wanderings-popup',
    })

    map.on('mousemove', 'travel-dots', (e) => {
      if (!e.features || !e.features.length) return
      const f = e.features[0]
      const coords = (f.geometry as GeoJSON.Point).coordinates as [number, number]
      const props = f.properties as { city: string; country: string }
      map.getCanvas().style.cursor = 'pointer'
      popup.setLngLat(coords).setHTML(`<b>${props.city}</b> · ${props.country}`).addTo(map)
    })
    map.on('mouseleave', 'travel-dots', () => {
      map.getCanvas().style.cursor = ''
      popup.remove()
    })

    if (!REDUCE_MOTION) {
      // Subtle ambient zoom-in on first paint, like Google Photos opens with
      map.easeTo({ zoom: 1.8, duration: 1800, easing: (t) => 1 - Math.pow(1 - t, 3) })
    }
  })
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

  // Lazy mount when the section scrolls into view — saves ~280KB on first paint
  // for users who never scroll there.
  if (typeof IntersectionObserver === 'undefined') {
    void mountMap(container, points)
    return
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          void mountMap(container, points)
          io.disconnect()
          break
        }
      }
    },
    { rootMargin: '300px 0px' }
  )
  io.observe(container)
}
