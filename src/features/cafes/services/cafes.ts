import { supabase } from '@/lib/supabase'
import type { Cafe, NewCafe } from '@/types/cafe'

const CAFE_TABLE = 'cafes'

export async function getCafes(): Promise<Cafe[]> {
  const { data, error } = await supabase.from(CAFE_TABLE).select('*')

  if (error) {
    throw error
  }

  return data
}

export async function createCafe(cafe: NewCafe): Promise<void> {
  const { error } = await supabase.from(CAFE_TABLE).insert([cafe])

  if (error) {
    throw error
  }
}
