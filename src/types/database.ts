import type { Database, Json } from '@/types/supabase'

export type { Json } from '@/types/supabase'

type Tables = Database['public']['Tables']

export type UserRow = Tables['users']['Row']
export type RoleRow = Tables['roles']['Row']

export type PinInsert = Tables['pins']['Insert']
export type PinRow = Tables['pins']['Row']
export type LocationInsert = Tables['locations']['Insert']
export type LocationRow = Tables['locations']['Row']

export type CategoryRow = Tables['categories']['Row']

export type ImageType = Tables['pins']['Row']['images'] extends Json[] ? Json : never

export type GeoJsonPoint = {
  type: string
  coordinates: [number, number]
}

export type MapPinRow = {
  id: string
  title: string
  category_id: string
  get_geojson: GeoJsonPoint | null
  categories: CategoryRow
}

export type MarkerRow = Pick<
  PinRow,
  'id' | 'title' | 'description' | 'images' | 'category_id' | 'characteristics_ids' | 'location_id'
> & {
  get_geojson: Json | null
  locations: Pick<LocationRow, 'name' | 'address' | 'postal_code' | 'email' | 'phone'>
  categories: { typology_id: string }
}
