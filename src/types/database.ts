import type { Database, Json } from '@/types/supabase'

export type { Json } from '@/types/supabase'

export type Tables = Database['public']['Tables']

export type UserRow = Tables['users']['Row']
export type RoleRow = Tables['roles']['Row']
export type ContactMessageRow = Tables['contact_messages']['Row']
export type ContactMessageInsert = Tables['contact_messages']['Insert']

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

export type ImageType = {
  url: string
  alt?: string
  id?: string
}

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

export type SuggestedPinRow = {
  id: string
  pin_id: string | null
  status: string
  title: string
  description: string | null
  category_id: string
  characteristics_ids: string[]
  images: Json
  coordinates: unknown
  location_name: string | null
  address: string | null
  postal_code: string | null
  email: string | null
  phone: string | null
  phone_area_code: number | null
  access: string | null
  accessibility: boolean | null
  has_opening_hours: boolean
  opening_hours: Json | null
  networks: Json
  created_by: string
  created_at: string
  updated_by: string | null
  updated_at: string
}

export type SuggestedPinInsert = {
  id?: string
  pin_id?: string | null
  status?: string
  title: string
  description?: string | null
  category_id: string
  characteristics_ids?: string[]
  images?: Json
  coordinates?: unknown
  location_name?: string | null
  address?: string | null
  postal_code?: string | null
  email?: string | null
  phone?: string | null
  phone_area_code?: number | null
  access?: string | null
  accessibility?: boolean | null
  has_opening_hours?: boolean
  opening_hours?: Json | null
  networks?: Json
  created_by: string
  created_at?: string
  updated_by?: string | null
  updated_at?: string
}

export type SuggestedPinUpdate = Partial<SuggestedPinInsert>
