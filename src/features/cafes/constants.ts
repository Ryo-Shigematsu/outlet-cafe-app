import type { Coordinates } from '@/types/cafe'

export const DEFAULT_MAP_CENTER: Coordinates = [139.7671, 35.6812]
export const MAP_STYLE = 'mapbox://styles/mapbox/streets-v12'
export const INITIAL_MAP_ZOOM = 14
export const SELECTED_CAFE_ZOOM = 16
export const CURRENT_LOCATION_MARKER_COLOR = '#3b82f6'
export const CAFE_MARKER_COLOR = '#ef4444'
export const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ''
