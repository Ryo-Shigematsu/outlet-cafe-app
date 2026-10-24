'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { supabase } from '@/lib/supabase'

// カフェデータの型定義
type Cafe = {
  id: string
  name: string
  latitude: number
  longitude: number
  has_outlet: boolean
  has_wifi: boolean
}

// Mapboxのアクセストークンを設定
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

export default function Home() {
  const mapContainer = useRef<HTMLDivElement | null>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [cafes, setCafes] = useState<Cafe[]>([])
  const markersRef = useRef<mapboxgl.Marker[]>([]) // マーカーを管理する参照

  const [lng] = useState<number>(139.7671) // 初期値：東京駅周辺の経度
  const [lat] = useState<number>(35.6812)  // 初期値：東京駅周辺の緯度
  const [zoom] = useState<number>(13)

  // 1. 地図の初期化と現在地取得
  useEffect(() => {
    if (map.current) return
    if (!mapContainer.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: zoom,
    })

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLng = position.coords.longitude
          const userLat = position.coords.latitude

          if (!map.current) return

          // 地図の中心を現在地に移動
          map.current.flyTo({ center: [userLng, userLat], zoom: 14 })

          // 現在地に青いピンを立てる
          new mapboxgl.Marker({ color: '#3b82f6' })
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

  // 2. Supabaseからカフェデータを取得する
  useEffect(() => {
    async function fetchCafes() {
      const { data, error } = await supabase.from('cafes').select('*')
      if (error) {
        console.error('カフェデータの取得に失敗しました:', error)
      } else if (data) {
        setCafes(data)
      }
    }
    fetchCafes()
  }, [])

  // 3. 取得したカフェデータを地図上にピンとして配置する
  useEffect(() => {
    if (!map.current) return

    // 既存のマーカーがあれば一旦すべて削除
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    // カフェごとにピンを生成
    cafes.forEach((cafe) => {
      const popupHtml = `
        <div style="color: #333; padding: 4px;">
          <h3 style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">${cafe.name}</h3>
          <p style="font-size: 12px; margin: 0;">🔌 コンセント: ${cafe.has_outlet ? 'あり ✅' : 'なし ❌'}</p>
          <p style="font-size: 12px; margin: 0;">📶 Wi-Fi: ${cafe.has_wifi ? 'あり ✅' : 'なし ❌'}</p>
        </div>
      `

      // カフェのピンは赤色（デフォルト）で表示
      const marker = new mapboxgl.Marker({ color: '#ef4444' })
        .setLngLat([cafe.longitude, cafe.latitude])
        .setPopup(new mapboxgl.Popup().setHTML(popupHtml))
        .addTo(map.current!)

      markersRef.current.push(marker)
    })
  }, [cafes])

  return (
    <main className="relative w-full h-screen">
      {/* 地図コンテナ */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* UIカード */}
      <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-md z-10">
        <h1 className="font-bold text-lg text-gray-800">電源・Wi-Fiカフェ検索</h1>
        <p className="text-sm text-gray-600">登録店舗数: {cafes.length}件</p>
      </div>
    </main>
  )
}