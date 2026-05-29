import { z } from 'astro/zod'
import type { Json } from '@/types/supabase'
import type { Database } from '@/types/supabase'
import { markerSchema } from '@/schemas/marker.server'

export type ImageType = Database['public']['Tables']['pins']['Row']['images'] extends Json[] ? Json : never
export type PinInsert = Database['public']['Tables']['pins']['Insert']
export type PinRow = Database['public']['Tables']['pins']['Row']
export type LocationInsert = Database['public']['Tables']['locations']['Insert']
export type LocationRow = Database['public']['Tables']['locations']['Row']

export type MarkerType = z.infer<typeof markerSchema>

export type GeoJsonPoint = {
  type: string
  coordinates: [number, number]
}

export function pointCoordinates(geojson: Json): { latitude: number, longitude: number } {
  const { coordinates } = geojson as GeoJsonPoint
  return {
    latitude: coordinates[1],
    longitude: coordinates[0],
  }
}

