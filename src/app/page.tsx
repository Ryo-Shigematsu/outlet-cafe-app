'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { supabase } from '@/lib/supabase'

type Cafe = {
  id: string
  name: string
  latitude: number
  longitude: number
  has_outlet: boolean
  has_wifi: boolean
}

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

export default function Home() {
  const mapContainer = useRef<HTMLDivElement | null>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [cafes, setCafes] = useState<Cafe[]>([])
  const markersRef = useRef<mapboxgl.Marker[]>([])

  // 地図の初期中心座標と、位置情報の読み込み完了フラグ
  const [center, setCenter] = useState<[number, number] | null>(null)
  const [isLocationLoaded, setIsLocationLoaded] = useState<boolean>(false)

  // 1. まず最初にユーザーの現在地を取得する
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLng = position.coords.longitude
          const userLat = position.coords.latitude
          setCenter([userLng, userLat])
          setIsLocationLoaded(true)
        },
        (error) => {
          console.log('位置情報の取得に失敗しました:', error.message)
          // 取得失敗時はデフォルトで東京駅を設定
          setCenter([139.7671, 35.6812])
          setIsLocationLoaded(true)
        }
      )
    } else {
      // Geolocation非対応の場合
      setCenter([139.7671, 35.6812])
      setIsLocationLoaded(true)
    }
  }, [])

  // 2. 現在地（またはフォールバック座標）が決まってから、最初からその場所で地図を初期化する
  useEffect(() => {
    if (!isLocationLoaded || !center || map.current) return
    if (!mapContainer.current) return

    // 最初から現在地を中心にして地図を作成
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: center,
      zoom: 14,
    })

    // 現在地に青いピンを立てる
    new mapboxgl.Marker({ color: '#3b82f6' })
      .setLngLat(center)
      .setPopup(new mapboxgl.Popup().setHTML('<h3>現在地</h3>'))
      .addTo(map.current)
  }, [isLocationLoaded, center])

  // 3. Supabaseからカフェデータを取得する
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

  // 4. 取得したカフェデータを地図上にピンとして配置する
  useEffect(() => {
    if (!map.current) return

    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    cafes.forEach((cafe) => {
      const popupHtml = `
        <div style="color: #333; padding: 4px;">
          <h3 style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">${cafe.name}</h3>
          <p style="font-size: 12px; margin: 0;">🔌 コンセント: ${cafe.has_outlet ? 'あり ✅' : 'なし ❌'}</p>
          <p style="font-size: 12px; margin: 0;">📶 Wi-Fi: ${cafe.has_wifi ? 'あり ✅' : 'なし ❌'}</p>
        </div>
      `

      const marker = new mapboxgl.Marker({ color: '#ef4444' })
        .setLngLat([cafe.longitude, cafe.latitude])
        .setPopup(new mapboxgl.Popup().setHTML(popupHtml))
        .addTo(map.current!)

      markersRef.current.push(marker)
    })
  }, [cafes])

  return (
    <main className="relative w-full h-screen">
      <div ref={mapContainer} className="w-full h-full" />

      <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-md z-10">
        <h1 className="font-bold text-lg text-gray-800">電源・Wi-Fiカフェ検索</h1>
        <p className="text-sm text-gray-600">登録店舗数: {cafes.length}件</p>
      </div>
    </main>
  )
}