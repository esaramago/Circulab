import { defineAction, ActionError, type ActionErrorCode } from 'astro:actions'
import { fetchDB } from '@/utils/fetchDB'
import type { Database, Json } from '@/types/supabase'
type MarkerType = Database['public']['Tables']['pins']['Row']
import type { Marker } from '@/types/data'

export const getMarkers = defineAction({
  handler: async () => {
    try {
      const { data, error } = await fetchDB('pins').select(`
        id,
        title,
        description,
        images,
        get_geojson,
        categories (
          name,
          typologies (
            name
          )
        ),
        characteristics_ids,
        locations (
          name,
          address,
          postal_code,
          location,
          get_geojson,
          email,
          phone
        )
      `)
      if (error) {
        throw new ActionError({
          message: error.message || 'Failed to get pins',
          code: error.code as ActionErrorCode
        })
      }

      const markers = data.map((marker: MarkerType) => ({
        id: marker.id,
        title: marker.title,
        description: marker.description,
        images: marker.images,
        category: marker.categories.name,
        typology: marker.categories.typologies.name,
        characteristics: marker.characteristics_ids,
        location: marker.locations.name,
        address: marker.locations.address,
        postal_code: marker.locations.postal_code,
        email: marker.locations.email,
        phone: marker.locations.phone,
        coordinates: {
          latitude: marker.get_geojson.coordinates[1],
          longitude: marker.get_geojson.coordinates[0]
        }
      } as Marker))

      return markers
    } catch (error: any) {
      throw new ActionError({
        message: error.message || 'Failed to get public user',
        code: error.code as ActionErrorCode
      })
    }
  },
})