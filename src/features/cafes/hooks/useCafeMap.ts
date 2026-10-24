'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import {
  CAFE_MARKER_COLOR,
  CURRENT_LOCATION_MARKER_COLOR,
  INITIAL_MAP_ZOOM,
  MAPBOX_ACCESS_TOKEN,
  MAP_STYLE,
  SELECTED_CAFE_ZOOM,
} from '@/features/cafes/constants'
import type { Cafe, Coordinates } from '@/types/cafe'

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN

function createCurrentLocationPopup(): HTMLElement {
  const content = document.createElement('div')
  content.textContent = '現在地'
  content.style.color = '#1f2937'
  content.style.fontWeight = 'bold'
  content.style.padding = '4px'
  return content
}

function createCafePopup(cafe: Cafe): HTMLElement {
  const content = document.createElement('div')
  content.style.color = '#333'
  content.style.padding = '4px'

  const name = document.createElement('h3')
  name.textContent = cafe.name
  name.style.fontWeight = 'bold'
  name.style.fontSize = '14px'
  name.style.marginBottom = '4px'
  content.append(name)

  const outlet = document.createElement('p')
  outlet.textContent = `🔌 コンセント: ${cafe.has_outlet ? 'あり ✅' : 'なし ❌'}`
  outlet.style.fontSize = '12px'
  outlet.style.margin = '0'
  content.append(outlet)

  const wifi = document.createElement('p')
  wifi.textContent = `📶 Wi-Fi: ${cafe.has_wifi ? 'あり ✅' : 'なし ❌'}`
  wifi.style.fontSize = '12px'
  wifi.style.margin = '0'
  content.append(wifi)

  return content
}

export function useCafeMap(cafes: Cafe[], center: Coordinates | null) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const [isMapReady, setIsMapReady] = useState(false)

  useEffect(() => {
    if (!center || !containerRef.current) return

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center,
      zoom: INITIAL_MAP_ZOOM,
    })

    mapRef.current = map

    map.on('load', () => {
      try {
        map.setLanguage('ja')
      } catch (error) {
        console.error('言語設定に失敗しました:', error)
      }
      setIsMapReady(true)
    })

    new mapboxgl.Marker({ color: CURRENT_LOCATION_MARKER_COLOR })
      .setLngLat(center)
      .setPopup(new mapboxgl.Popup().setDOMContent(createCurrentLocationPopup()))
      .addTo(map)

    return () => {
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
      map.remove()
      mapRef.current = null
      setIsMapReady(false)
    }
  }, [center])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !isMapReady) return

    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = cafes.map((cafe) =>
      new mapboxgl.Marker({ color: CAFE_MARKER_COLOR })
        .setLngLat([cafe.longitude, cafe.latitude])
        .setPopup(new mapboxgl.Popup().setDOMContent(createCafePopup(cafe)))
        .addTo(map)
    )
  }, [cafes, isMapReady])

  const flyToCurrentLocation = useCallback(() => {
    if (!mapRef.current || !center) return
    mapRef.current.flyTo({ center, zoom: INITIAL_MAP_ZOOM, essential: true })
  }, [center])

  const selectCafe = useCallback((cafe: Cafe) => {
    mapRef.current?.flyTo({
      center: [cafe.longitude, cafe.latitude],
      zoom: SELECTED_CAFE_ZOOM,
      essential: true,
    })
  }, [])

  return { containerRef, flyToCurrentLocation, selectCafe }
}
