import { defineAction, ActionError, type ActionErrorCode } from 'astro:actions'
import { fetchDB } from '@/utils/fetchDB'
import { pointCoordinates, type GeoJsonPoint, type ImageType, type MarkerType } from '@/types/data'
import { z } from 'astro/zod'
import type { Database } from '@/types/supabase'
type PinInsert = Database['public']['Tables']['pins']['Insert']
type LocationInsert = Database['public']['Tables']['locations']['Insert']

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
        images: marker.images as ImageType[],
        category: marker.category_id,
        characteristics: marker.characteristics_ids,
        location: marker.location_id,
        address: marker.locations.address,
        postal_code: marker.locations.postal_code,
        email: marker.locations.email as string,
        phone: marker.locations.phone as number,
        coordinates: pointCoordinates(marker.get_geojson as GeoJsonPoint),
      } satisfies MarkerType))

      return markers
    } catch (error: any) {
      throw new ActionError({
        message: error.message || 'Failed to get public user',
        code: error.code as ActionErrorCode
      })
    }
  },
})

export const addMarker = defineAction({
  input: z.object({
    title: z.string(),
    category_id: z.string(),
    characteristics_ids: z.array(z.string()),
    coordinates: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }),
    description: z.string().optional(),
    images: z.array(z.object({
      bucket: z.string(),
      path: z.string(),
    })),
    //location_id: z.string(),
  }),
  handler: async (input) => {
    try {

      const { data: locationsData, error: locationsError } = await fetchDB('locations').insert({
        name: input.location_name,
        address: input.address,
        postal_code: input.postal_code,
        location: input.location,
        coordinates: input.coordinates,
        email: input.email,
        phone: input.phone,
      })

      if (locationsError) {
        throw new ActionError({
          message: locationsError.message || 'Failed to add marker',
          code: locationsError.code as ActionErrorCode
        })
      }

      const { data: pinsData, error: pinsError } = await fetchDB('pins').insert({
        title: input.title || '',
        description: input.description || '',
        images: input.images.map((image) => ({
          bucket: image.bucket,
          path: image.path,
        })),
        get_geojson: {
          type: 'Point',
          coordinates: [input.coordinates.longitude, input.coordinates.latitude],
        },
        category_id: input.category_id,
        characteristics_ids: input.characteristics_ids,
        location_id: input.location_id,
      })

    } catch (error: any) {
      throw new ActionError({
        message: error.message || 'Failed to add marker',
        code: error.code as ActionErrorCode
      })
    }
  },
})
