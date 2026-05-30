import type {
  TypologyRow,
  CategoryRow,
  CharacteristicRow,
  LocationRow,
  ImageType,
  GeoJsonPoint
} from '@/types/database'

export type Pin = {
  id: string
  title: string
  coordinates: {
    latitude: number
    longitude: number
  }
  category_id: string
  typology_id: string
}

export type Resource = {
  title: string
  images?: ImageType[]
  category_id?: string
  typology_id?: string
  characteristics_ids?: string[]
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

export type ResourcePopup = {
  id: string
  title: string
  description: string
  images: ImageType[]
  typology: TypologyRow
  category: CategoryRow
  characteristics: CharacteristicRow[]
  location: LocationRow
  coordinates: GeoJsonPoint
}
