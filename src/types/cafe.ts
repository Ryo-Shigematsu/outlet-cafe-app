export type Coordinates = [longitude: number, latitude: number]

export type Cafe = {
  id: string
  name: string
  latitude: number
  longitude: number
  has_outlet: boolean
  has_wifi: boolean
}

export type NewCafe = Omit<Cafe, 'id'>
