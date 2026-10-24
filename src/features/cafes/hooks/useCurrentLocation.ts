'use client'

import { useEffect, useState } from 'react'
import { DEFAULT_MAP_CENTER } from '@/features/cafes/constants'
import type { Coordinates } from '@/types/cafe'

export function useCurrentLocation(): Coordinates | null {
  const [location, setLocation] = useState<Coordinates | null>(null)

  useEffect(() => {
    const locationPromise = new Promise<Coordinates>((resolve) => {
      if (!navigator.geolocation) {
        resolve(DEFAULT_MAP_CENTER)
        return
      }

      navigator.geolocation.getCurrentPosition(
        ({ coords }) => resolve([coords.longitude, coords.latitude]),
        (error) => {
          console.warn('位置情報の取得に失敗しました:', error.message)
          resolve(DEFAULT_MAP_CENTER)
        }
      )
    })

    void locationPromise.then(setLocation)
  }, [])

  return location
}
