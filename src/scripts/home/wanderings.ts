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
    attributionControl: false, // hidden - we acknowledge in /humans.txt instead
    pitchWithRotate: false,
    dragRotate: false,
    touchPitch: false,
  })

  // Disable map rotation; we want a flat, calm experience.
  map.touchZoomRotate.disableRotation()

  map.on('load', () => {
    // Match the Google-Photos travel-timeline reference exactly:
    //  - deep navy ocean with subtle glow (not black)
    //  - muted teal as default land (Europe / Asia / Americas vegetated)
    //  - dusty purple-grey for arid land (Sahara, Middle East, outback)
    //  - light blue-grey for ice / Greenland
    //  - white country labels, soft sky-blue ocean labels
    //  - faint dashed country borders
    const OCEAN = '#0d2040'
    const LAND = '#3d6864' // muted teal - default continents
    const LAND_LIGHT = '#4f6f6c' // slightly lighter teal for grass/farmland
    const LAND_ARID = '#5a5b6e' // dusty purple-grey for sand/desert/rock
    const LAND_PARK = '#2d5552' // darker teal for wood/forest/park
    const GLACIER = '#8095ad' // light blue-grey for ice/snow (Greenland)
    const BORDER = 'rgba(255, 255, 255, 0.20)'
    const BORDER_BOLD = 'rgba(255, 255, 255, 0.30)'
    const TEXT_FILL = 'rgba(235, 240, 248, 0.92)'
    const TEXT_HALO = 'rgba(13, 32, 64, 0.85)'
    const OCEAN_LABEL = 'rgba(140, 175, 215, 0.85)' // soft sky-blue for ocean/sea names

    const style = map.getStyle()
    for (const layer of style.layers) {
      const id = layer.id
      const type = layer.type
      try {
        if (id === 'background') {
          map.setPaintProperty(id, 'background-color', LAND)
        } else if (type === 'fill') {
          if (/water|ocean|sea|lake|river|stream|reservoir/.test(id)) {
            map.setPaintProperty(id, 'fill-color', OCEAN)
          } else if (/ice|glacier|snow/.test(id)) {
            map.setPaintProperty(id, 'fill-color', GLACIER)
          } else if (/sand|desert|beach|rock|bare/.test(id)) {
            map.setPaintProperty(id, 'fill-color', LAND_ARID)
          } else if (/wood|forest|park|nature_reserve|cemetery/.test(id)) {
            map.setPaintProperty(id, 'fill-color', LAND_PARK)
          } else if (/grass|farmland|crop|meadow|scrub|landcover|landuse/.test(id)) {
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
            map.setLayoutProperty(id, 'visibility', 'none')
          } else if (/rail|aero|ferry|path|footway/.test(id)) {
            map.setLayoutProperty(id, 'visibility', 'none')
          }
        } else if (type === 'symbol') {
          if (/poi|housenumber|street|road|highway|transit/.test(id)) {
            map.setLayoutProperty(id, 'visibility', 'none')
          } else if (/water_name|ocean|marine|sea_|water/.test(id)) {
            // Ocean / sea labels - sky-blue tone like the reference
            map.setPaintProperty(id, 'text-color', OCEAN_LABEL)
            map.setPaintProperty(id, 'text-halo-color', OCEAN)
            map.setPaintProperty(id, 'text-halo-width', 0.6)
          } else {
            map.setPaintProperty(id, 'text-color', TEXT_FILL)
            map.setPaintProperty(id, 'text-halo-color', TEXT_HALO)
            map.setPaintProperty(id, 'text-halo-width', 1.2)
          }
        }
      } catch {
        // Layer may not support that paint property - skip silently.
      }
    }

    // OpenFreeMap's dark style only ships landcover for wood + ice + glacier,
    // so at world zoom the Sahara, outback, Middle East all look identical to
    // Europe. To replicate the reference's dual-tone topographic feel, we
    // overlay a raster-dem hillshade on top of the base teal - this paints
    // mountains and arid relief darker / lighter naturally, giving the same
    // "textured" continents you see in Google Photos.
    if (!map.getSource('terrain-dem')) {
      try {
        map.addSource('terrain-dem', {
          type: 'raster-dem',
          tiles: ['https://elevation-tiles-prod.s3.amazonaws.com/terrarium/{z}/{x}/{y}.png'],
          encoding: 'terrarium',
          tileSize: 256,
          maxzoom: 12,
          attribution: '',
        })
        map.addLayer(
          {
            id: 'hillshade',
            type: 'hillshade',
            source: 'terrain-dem',
            paint: {
              'hillshade-exaggeration': 0.85,
              'hillshade-shadow-color': '#08111f',
              'hillshade-highlight-color': '#9aabbe',
              'hillshade-accent-color': '#6d6680', // dusty purple - mimics arid tone in mountains
              'hillshade-illumination-direction': 335,
            },
          },
          map.getLayer('landcover_wood') ? 'landcover_wood' : undefined
        )
      } catch {
        // DEM tiles may be blocked by CSP in prod - silently skip.
      }
    }

    // The Google Photos reference shows arid regions (Sahara, Arabian
    // Peninsula, Australian outback, US southwest) in a distinctly different
    // dusty-purple tone vs. the teal-vegetated continents. OpenFreeMap doesn't
    // expose those landcover classes at world zoom, so we overlay a small
    // hand-curated GeoJSON of those biomes at low alpha. Total weight: ~0.5KB.
    const aridRegions: GeoJSON.Feature[] = [
      // Sahara + Sahel transition
      {
        type: 'Feature',
        properties: { name: 'sahara' },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [-17, 14],
              [-17, 30],
              [35, 32],
              [50, 27],
              [50, 18],
              [38, 12],
              [22, 10],
              [0, 12],
              [-17, 14],
            ],
          ],
        },
      },
      // Arabian Peninsula
      {
        type: 'Feature',
        properties: { name: 'arabia' },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [35, 13],
              [35, 32],
              [60, 30],
              [60, 22],
              [56, 17],
              [44, 12],
              [35, 13],
            ],
          ],
        },
      },
      // Iran / Central Asia steppe
      {
        type: 'Feature',
        properties: { name: 'persia' },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [44, 27],
              [44, 42],
              [80, 47],
              [80, 35],
              [62, 25],
              [44, 27],
            ],
          ],
        },
      },
      // Australian outback
      {
        type: 'Feature',
        properties: { name: 'outback' },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [115, -32],
              [115, -19],
              [145, -19],
              [145, -32],
              [138, -36],
              [120, -35],
              [115, -32],
            ],
          ],
        },
      },
      // US Southwest (Mojave / Sonoran / Chihuahuan)
      {
        type: 'Feature',
        properties: { name: 'us-southwest' },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [-120, 31],
              [-120, 41],
              [-103, 41],
              [-103, 28],
              [-110, 26],
              [-118, 30],
              [-120, 31],
            ],
          ],
        },
      },
      // Atacama / Patagonia steppe
      {
        type: 'Feature',
        properties: { name: 'south-america-arid' },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [-72, -50],
              [-72, -22],
              [-65, -22],
              [-65, -50],
              [-72, -50],
            ],
          ],
        },
      },
    ]
    if (!map.getSource('arid')) {
      map.addSource('arid', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: aridRegions },
      })
      map.addLayer(
        {
          id: 'arid-fill',
          type: 'fill',
          source: 'arid',
          paint: { 'fill-color': LAND_ARID, 'fill-opacity': 0.55 },
        },
        map.getLayer('hillshade') ? 'hillshade' : undefined
      )
    }

    ;(window as unknown as { __wmap?: typeof map }).__wmap = map

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
        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 6, 3],
        // Coral palette - purple → coral → bright orange like the screenshot
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
        'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 14, 3, 28, 6, 70],
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

    // Tooltip on hover (city - country)
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

  // Lazy mount when the section scrolls into view - saves ~280KB on first paint
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
