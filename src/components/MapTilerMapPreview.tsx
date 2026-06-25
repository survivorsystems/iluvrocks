import { useEffect, useRef, useState } from 'react'
import type maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import {
  washingtonRegionLabels,
  washingtonRockhoundingRegions,
} from '../data/washingtonRockhoundingRegions'

type TileJson = {
  vector_layers?: Array<{ id: string }>
}

const skagitCenter: [number, number] = [-121.55, 48.52]

export default function MapTilerMapPreview() {
  const mapNode = useRef<HTMLDivElement | null>(null)
  const [status, setStatus] = useState('')
  const maptilerKey = (import.meta.env.VITE_MAPTILER_KEY ||
    import.meta.env.VITE_MAPTILER_API_KEY) as string | undefined

  useEffect(() => {
    if (!mapNode.current || !maptilerKey) {
      setStatus('MapTiler key needed for map preview.')
      return
    }

    let map: maplibregl.Map | undefined
    let isActive = true
    const key = encodeURIComponent(maptilerKey)

    void import('maplibre-gl').then(({ default: maplibre }) => {
      if (!isActive || !mapNode.current) return

      map = new maplibre.Map({
        container: mapNode.current,
        style: `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${key}`,
        center: skagitCenter,
        zoom: 8.4,
        attributionControl: { compact: true },
      })

      map.addControl(
        new maplibre.NavigationControl({ visualizePitch: true }),
        'bottom-right',
      )

      map.on('load', () => {
        if (!map) return
        void addLandformLayer(map, key)
          .catch(() => {
            setStatus('Landform layer could not load yet.')
          })
          .finally(() => {
            if (map) addWashingtonRegionLayer(map, maplibre)
          })
      })

      map.on('error', () => {
        setStatus('Map preview could not load yet.')
      })
    })

    return () => {
      isActive = false
      map?.remove()
    }
  }, [maptilerKey])

  return (
    <div className="home-map-frame home-map-frame-interactive">
      <div ref={mapNode} className="maplibre-preview" aria-label="Map preview" />
      <div className="map-region-legend" aria-hidden="true">
        <strong>Washington regions</strong>
        <span>Approximate zones. Click for geology and common finds.</span>
      </div>
      {status ? <p className="map-preview-status">{status}</p> : null}
    </div>
  )
}

function addWashingtonRegionLayer(
  map: maplibregl.Map,
  maplibre: typeof maplibregl,
) {
  if (map.getSource('wa-rockhounding-regions')) return

  map.addSource('wa-rockhounding-regions', {
    type: 'geojson',
    data: washingtonRockhoundingRegions,
  })
  map.addSource('wa-rockhounding-region-labels', {
    type: 'geojson',
    data: washingtonRegionLabels,
  })

  const beforeLayer = firstSymbolLayerId(map)
  map.addLayer(
    {
      id: 'wa-rockhounding-region-fill',
      type: 'fill',
      source: 'wa-rockhounding-regions',
      paint: {
        'fill-color': ['get', 'color'],
        'fill-opacity': 0.28,
      },
    },
    beforeLayer,
  )
  map.addLayer(
    {
      id: 'wa-rockhounding-region-line',
      type: 'line',
      source: 'wa-rockhounding-regions',
      paint: {
        'line-color': '#F5F4EF',
        'line-opacity': 0.9,
        'line-width': 1.5,
      },
    },
    beforeLayer,
  )
  map.addLayer({
    id: 'wa-rockhounding-region-label',
    type: 'symbol',
    source: 'wa-rockhounding-region-labels',
    layout: {
      'text-field': ['concat', ['to-string', ['get', 'id']], '. ', ['get', 'name']],
      'text-size': 11,
      'text-font': ['Open Sans Semibold'],
      'text-variable-anchor': ['center'],
      'text-justify': 'center',
      'text-max-width': 10,
      'text-allow-overlap': false,
    },
    paint: {
      'text-color': '#17343F',
      'text-halo-color': '#F5F4EF',
      'text-halo-width': 1.3,
    },
  })

  map.on('mouseenter', 'wa-rockhounding-region-fill', () => {
    map.getCanvas().style.cursor = 'pointer'
  })
  map.on('mouseleave', 'wa-rockhounding-region-fill', () => {
    map.getCanvas().style.cursor = ''
  })
  map.on('click', 'wa-rockhounding-region-fill', (event) => {
    const feature = event.features?.[0]
    if (!feature?.properties) return
    const props = feature.properties as Record<string, string | number>
    new maplibre.Popup({ closeButton: true, maxWidth: '320px' })
      .setLngLat(event.lngLat)
      .setHTML(
        `<article class="map-region-popup">
          <p>${props.id}. ${props.name}</p>
          <strong>Primary finds</strong>
          <span>${props.primaryFinds}</span>
          <strong>Geology</strong>
          <span>${props.geologyNotes}</span>
          <strong>Collector note</strong>
          <span>${props.personality}</span>
        </article>`,
      )
      .addTo(map)
  })
}

async function addLandformLayer(map: maplibregl.Map, key: string) {
  const url = `https://api.maptiler.com/tiles/landform/tiles.json?key=${key}`
  const response = await fetch(url)
  const tileJson = (await response.json()) as TileJson
  const sourceLayer = tileJson.vector_layers?.[0]?.id

  if (map.getSource('landform')) return

  if (sourceLayer) {
    map.addSource('landform', {
      type: 'vector',
      url,
    })
    map.addLayer(
      {
        id: 'landform-fill',
        type: 'fill',
        source: 'landform',
        'source-layer': sourceLayer,
        paint: {
          'fill-color': '#B7A48A',
          'fill-opacity': 0.2,
        },
      },
      firstSymbolLayerId(map),
    )
    map.addLayer(
      {
        id: 'landform-line',
        type: 'line',
        source: 'landform',
        'source-layer': sourceLayer,
        paint: {
          'line-color': '#355C6B',
          'line-opacity': 0.35,
          'line-width': 0.8,
        },
      },
      firstSymbolLayerId(map),
    )
    return
  }

  map.addSource('landform', {
    type: 'raster',
    url,
    tileSize: 256,
  })
  map.addLayer(
    {
      id: 'landform-raster',
      type: 'raster',
      source: 'landform',
      paint: {
        'raster-opacity': 0.45,
      },
    },
    firstSymbolLayerId(map),
  )
}

function firstSymbolLayerId(map: maplibregl.Map) {
  return map.getStyle().layers?.find((layer) => layer.type === 'symbol')?.id
}
