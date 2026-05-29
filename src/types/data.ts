import { z } from 'astro/zod'
import type { Database, Json } from '@/types/supabase'
import { markerSchema } from '@/schemas/marker.server'

export type PinInsert = Database['public']['Tables']['pins']['Insert']
export type PinRow = Database['public']['Tables']['pins']['Row']
export type LocationInsert = Database['public']['Tables']['locations']['Insert']
export type LocationRow = Database['public']['Tables']['locations']['Row']

export type CategoryRow = Database['public']['Tables']['categories']['Row']

export type ImageType = Database['public']['Tables']['pins']['Row']['images'] extends Json[] ? Json : never
export type GeoJsonPoint = {
  type: string
  coordinates: [number, number]
}

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

export type MapPinRow = {
  id: string
  title: string
  category_id: string
  get_geojson: GeoJsonPoint | null
  categories: CategoryRow
}

export type MarkerType = z.infer<typeof markerSchema>
