import type {
  PinRow,
  TypologyRow,
  CategoryRow,
  LocationRow,
  ImageType,
  GeoJsonPoint
} from '@/types/database'
import { z } from 'astro/zod'
import { resourceSchema } from '@/schemas/resource.server'

export type Resource = z.infer<typeof resourceSchema>

export type Pin = Pick<PinRow, 'id' | 'title' | 'category_id'> & {
  coordinates: {
    latitude: number
    longitude: number
  }
  typology_id: CategoryRow['typology_id']
}

export type ResourcePopup = Pick<PinRow, 'id' | 'title' | 'description'> & {
  images: ImageType[]
  category: CategoryRow['name']
  typology: TypologyRow['name']
  characteristics: CategoryRow['name']
  location: LocationRow['name']
  coordinates: GeoJsonPoint
} & Pick<LocationRow, 'address' | 'postal_code' | 'email' | 'phone'>
