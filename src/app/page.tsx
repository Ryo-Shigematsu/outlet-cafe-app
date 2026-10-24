'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

// Mapboxのアクセストークンを設定
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

export default function Home() {
  const mapContainer = useRef<HTMLDivElement | null>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [lng] = useState<number>(139.7671) // 初期値：東京駅周辺の経度
  const [lat] = useState<number>(35.6812)  // 初期値：東京駅周辺の緯度
  const [zoom] = useState<number>(13)

  useEffect(() => {
    if (map.current) return // すでに地図が初期化されている場合はスキップ
    if (!mapContainer.current) return

    // 1. 地図の初期化
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12', // スタイル（標準的な地図）
      center: [lng, lat],
      zoom: zoom,
    })

    // 2. ユーザーの現在地を取得して地図を移動＆ピンを立てる
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLng = position.coords.longitude
          const userLat = position.coords.latitude

          if (!map.current) return

          // 地図の中心を現在地に移動
          map.current.flyTo({ center: [userLng, userLat], zoom: 15 })

          // 現在地にピン（マーカー）を立てる
          new mapboxgl.Marker({ color: '#3b82f6' }) // 青色のピン
            .setLngLat([userLng, userLat])
            .setPopup(new mapboxgl.Popup().setHTML('<h3>現在地</h3>'))
            .addTo(map.current)
        },
        (error) => {
          console.log('位置情報の取得に失敗しました:', error.message)
        }
      )
    }
  }, [lng, lat, zoom])

  return (
    <main className="relative w-full h-screen">
      {/* 地図を表示するコンテナ */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* 上部に重ねるタイトルやUIのサンプル */}
      <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-md z-10">
        <h1 className="font-bold text-lg text-gray-800">電源・Wi-Fiカフェ検索</h1>
        <p className="text-sm text-gray-600">現在地周辺の作業スペースを探そう</p>
      </div>
    </main>
  )
}