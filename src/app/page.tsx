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

  const [center, setCenter] = useState<[number, number] | null>(null)
  const [isLocationLoaded, setIsLocationLoaded] = useState<boolean>(false)

  // 投稿モーダル用のステート
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [cafeName, setCafeName] = useState<string>('')
  const [hasOutlet, setHasOutlet] = useState<boolean>(true)
  const [hasWifi, setHasWifi] = useState<boolean>(true)
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null)

  // 1. 現在地取得
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLng = position.coords.longitude
          const userLat = position.coords.latitude
          setCenter([userLng, userLat])
          setCurrentPosition({ lat: userLat, lng: userLng })
          setIsLocationLoaded(true)
        },
        (error) => {
          console.log('位置情報の取得に失敗しました:', error.message)
          setCenter([139.7671, 35.6812])
          setCurrentPosition({ lat: 35.6812, lng: 139.7671 })
          setIsLocationLoaded(true)
        }
      )
    } else {
      setCenter([139.7671, 35.6812])
      setCurrentPosition({ lat: 35.6812, lng: 139.7671 })
      setIsLocationLoaded(true)
    }
  }, [])

  // 2. 地図初期化（日本語化対応含む）
  useEffect(() => {
    if (!isLocationLoaded || !center || map.current) return
    if (!mapContainer.current) return

    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: center,
      zoom: 14,
    })

    // 地図のラベルを日本語に設定
    mapInstance.on('load', () => {
      try {
        mapInstance.setLanguage('ja')
      } catch (e) {
        console.error('言語設定に失敗しました:', e)
      }
    })

    map.current = mapInstance

    // 現在地に青いピンを立てる（文字色をダークグレーにして可視性を改善）
    const popupHtml = `<div style="color: #1f2937; font-weight: bold; padding: 4px;">現在地</div>`
    new mapboxgl.Marker({ color: '#3b82f6' })
      .setLngLat(center)
      .setPopup(new mapboxgl.Popup().setHTML(popupHtml))
      .addTo(map.current)
  }, [isLocationLoaded, center])

  // 3. カフェデータ取得関数
  const fetchCafes = async () => {
    const { data, error } = await supabase.from('cafes').select('*')
    if (error) {
      console.error('カフェデータの取得に失敗しました:', error)
    } else if (data) {
      setCafes(data)
    }
  }

  useEffect(() => {
    fetchCafes()
  }, [])

  // 4. 取得したカフェデータを地図上にピンとして配置
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

  // 5. カフェ登録の送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cafeName.trim() || !currentPosition) return

    const { error } = await supabase.from('cafes').insert([
      {
        name: cafeName,
        latitude: currentPosition.lat,
        longitude: currentPosition.lng,
        has_outlet: hasOutlet,
        has_wifi: hasWifi,
      },
    ])

    if (error) {
      console.error('登録エラー:', error)
      alert('登録に失敗しました')
    } else {
      alert('カフェを登録しました！')
      setCafeName('')
      setHasOutlet(true)
      setHasWifi(true)
      setIsModalOpen(false)
      fetchCafes() // データを再取得してピンを更新
    }
  }

  return (
    <main className="relative w-full h-screen">
      <div ref={mapContainer} className="w-full h-full" />

      {/* 左上の情報カード ＆ 登録ボタン */}
      <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-md z-10 flex flex-col gap-3">
        <div>
          <h1 className="font-bold text-lg text-gray-800">電源・Wi-Fiカフェ検索</h1>
          <p className="text-sm text-gray-600">登録店舗数: {cafes.length}件</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-md transition shadow-sm"
        >
          ＋ 現在地にカフェを登録
        </button>
      </div>

      {/* 新規登録モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold text-gray-800 mb-4">新規カフェ登録</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">店舗名</label>
                <input
                  type="text"
                  value={cafeName}
                  onChange={(e) => setCafeName(e.target.value)}
                  placeholder="例: カフェ・ベローチェ 天神店"
                  required
                  className="w-full border border-gray-300 rounded-md p-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"                />
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasOutlet}
                    onChange={(e) => setHasOutlet(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  コンセントあり
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasWifi}
                    onChange={(e) => setHasWifi(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  Wi-Fiあり
                </label>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium py-2 px-4 rounded-md transition"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-md transition"
                >
                  登録する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}