'use client'

import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { CafeDashboard } from '@/features/cafes/components/CafeDashboard'
import { CafeListModal } from '@/features/cafes/components/CafeListModal'
import { CafeRegistrationModal } from '@/features/cafes/components/CafeRegistrationModal'
import { useCafeMap } from '@/features/cafes/hooks/useCafeMap'
import { useCurrentLocation } from '@/features/cafes/hooks/useCurrentLocation'
import { createCafe, getCafes } from '@/features/cafes/services/cafes'
import type { Cafe } from '@/types/cafe'

export default function CafeFinder() {
  const [cafes, setCafes] = useState<Cafe[]>([])
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false)
  const [isListOpen, setIsListOpen] = useState(false)
  const [cafeName, setCafeName] = useState('')
  const [hasOutlet, setHasOutlet] = useState(true)
  const [hasWifi, setHasWifi] = useState(true)
  const location = useCurrentLocation()
  const { containerRef, flyToCurrentLocation, selectCafe } = useCafeMap(cafes, location)

  const refreshCafes = useCallback(async () => {
    try {
      setCafes(await getCafes())
    } catch (error) {
      console.error('カフェデータの取得に失敗しました:', error)
    }
  }, [])

  useEffect(() => {
    void getCafes()
      .then(setCafes)
      .catch((error: unknown) => {
        console.error('カフェデータの取得に失敗しました:', error)
      })
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!cafeName.trim() || !location) return

    try {
      await createCafe({
        name: cafeName,
        latitude: location[1],
        longitude: location[0],
        has_outlet: hasOutlet,
        has_wifi: hasWifi,
      })
    } catch (error) {
      console.error('登録エラー:', error)
      alert('登録に失敗しました')
      return
    }

    alert('カフェを登録しました！')
    setCafeName('')
    setHasOutlet(true)
    setHasWifi(true)
    setIsRegistrationOpen(false)
    await refreshCafes()
  }

  const handleSelectCafe = (cafe: Cafe) => {
    selectCafe(cafe)
    setIsListOpen(false)
  }

  return (
    <main className="relative w-full h-screen">
      <div ref={containerRef} className="w-full h-full" />

      <CafeDashboard
        cafeCount={cafes.length}
        onOpenRegistration={() => setIsRegistrationOpen(true)}
        onOpenList={() => setIsListOpen(true)}
      />

      <button
        onClick={flyToCurrentLocation}
        className="absolute top-4 right-4 bg-white hover:bg-gray-100 text-gray-800 p-3 rounded-full shadow-md z-10 transition border border-gray-200 flex items-center justify-center"
        title="現在地に戻る"
      >
        📍
      </button>

      {isListOpen && (
        <CafeListModal
          cafes={cafes}
          onClose={() => setIsListOpen(false)}
          onSelectCafe={handleSelectCafe}
        />
      )}

      {isRegistrationOpen && (
        <CafeRegistrationModal
          cafeName={cafeName}
          hasOutlet={hasOutlet}
          hasWifi={hasWifi}
          onCafeNameChange={setCafeName}
          onHasOutletChange={setHasOutlet}
          onHasWifiChange={setHasWifi}
          onClose={() => setIsRegistrationOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
    </main>
  )
}
