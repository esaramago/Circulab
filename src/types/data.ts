import type { Json } from '@/types/supabase'
import type { Database } from '@/types/supabase'

export type ImageType = Database['public']['Tables']['pins']['Row']['images'] extends Json[] ? Json : never
export type MarkerType = Database['public']['Tables']['pins']['Row']

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
