export type Marker = {
  id: string
  title: string
  description?: string | null
  images?: {
    url: string
  }[] | null
  category: string
  typology: string
  characteristics?: string[]
  location: string
  address: string | null
  postal_code: string | null
  email?: string | null
  phone?: string | null
  coordinates: {
    latitude: number
    longitude: number
  }
}