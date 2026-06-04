import type { Database, Json } from '@/types/supabase'

export type { Json } from '@/types/supabase'

type Tables = Database['public']['Tables']

export type UserRow = Tables['users']['Row']
export type RoleRow = Tables['roles']['Row']

export type CategoryRow = Tables['categories']['Row']
export type CharacteristicRow = Tables['characteristics']['Row']
export type TypologyRow = Tables['typologies']['Row']
export type PinStatusRow = Tables['pin_status']['Row']

export const PIN_STATUS = {
  APPROVED: 'approved',
  REJECTED: 'rejected',
  PENDING: 'pending',
} as const

export type PinStatusCode = typeof PIN_STATUS[keyof typeof PIN_STATUS]

export type PinRow = Omit<Tables['pins']['Row'], 'status'> & {
  status: PinStatusCode | null
}
export type PinInsert = Omit<Tables['pins']['Insert'], 'status'> & {
  status?: PinStatusCode | null
}

export type LocationInsert = Tables['locations']['Insert']
export type LocationRow = Tables['locations']['Row']

export type ImageType = Tables['pins']['Row']['images'] extends Json[] ? Json : never

export type GeoJsonPoint = {
  type: string
  coordinates: [number, number]
}

export type ResourceRow = Pick<
  PinRow,
  'id' | 'title' | 'description' | 'images' | 'category_id' | 'characteristics_ids' | 'location_id' | 'status'
> & {
  get_geojson: Json | null
  locations: Pick<LocationRow, 'name' | 'address' | 'postal_code' | 'email' | 'phone'>
  categories: { typology_id: string }
}
