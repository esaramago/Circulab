export type MapPin = {
  id: string
  title: string
  coordinates: {
    latitude: number
    longitude: number
  }
  category_id: string
  typology_id: string
}

export type Marker = {
  title: string
  images?: { url: string }[]
  category?: string
  typology?: string
  characteristics?: string
  location?: string
  address?: string
  postal_code?: string
  coordinates?: {
    latitude: number
    longitude: number
  }
  email?: string
  phone?: string
  description?: string
}
