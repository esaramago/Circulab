import type {
  PinRow,
  TypologyRow,
  CategoryRow,
  LocationRow,
  ImageType,
  GeoJsonPoint
} from '@/types/database'
import type { WeekSchedule } from '@/types/add-resource-draft'
import { z } from 'astro/zod'
import { resourceSchema } from '@/schemas/resource.server'

export type Resource = z.infer<typeof resourceSchema>

export type Pin = Pick<PinRow, 'id' | 'title' | 'category_id'> & {
  coordinates: {
    latitude: number
    longitude: number
  }
  typology_id: CategoryRow['typology_id']
  typology: TypologyRow['name']
  category: CategoryRow['name']
  color?: TypologyRow['color'] | null
  category_color?: CategoryRow['color'] | null
  typology_color?: TypologyRow['color'] | null
  icon?: CategoryRow['icon'] | null
}

export type FullResource = Pick<PinRow, 'id' | 'title' | 'description'> & {
  images: ImageType[]
  category: CategoryRow['name']
  category_id?: CategoryRow['id'] | null
  typology: TypologyRow['name']
  typology_id?: TypologyRow['id'] | null
  characteristics?: CategoryRow['name'] | null
  characteristics_ids?: string[]
  location: LocationRow['name']
  coordinates: GeoJsonPoint
  accessibility: LocationRow['accessibility']
  status?: PinRow['status']
  networks?: { slug: string; name: string; value: string; icon?: string | null }[]
  has_opening_hours?: boolean
  opening_hours?: WeekSchedule | null
} & Pick<LocationRow, 'address' | 'postal_code' | 'email' | 'phone' | 'phone_area_code'>
