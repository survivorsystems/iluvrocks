import { useEffect, useRef, useState } from 'react'
import type maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

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
        void addLandformLayer(map, key).catch(() => {
          setStatus('Landform layer could not load yet.')
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
      {status ? <p className="map-preview-status">{status}</p> : null}
    </div>
  )
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
