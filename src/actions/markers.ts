import { defineAction, ActionError, type ActionErrorCode } from 'astro:actions'
import { fetchDB } from '@/utils/fetchDB'
import { pointCoordinates, type GeoJsonPoint, type ImageType, type MarkerType } from '@/types/data'
import { z } from 'astro/zod'

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
    name: z.string(),
    description: z.string(),
    images: z.array(z.object({
      url: z.string(),
      alt: z.string(),
    })),
    latitude: z.number(),
    longitude: z.number(),
    category: z.string(),
    characteristics: z.array(z.string()),
    location_id: z.string(),
    address: z.string(),
    postal_code: z.string(),
    email: z.string(),
    phone: z.number(),
  }),
  handler: async ({ name, description, images, latitude, longitude, category, characteristics, address, postal_code, email, phone }: z.infer<typeof input>) => {
    try {
      const { data, error } = await fetchDB('pins').insert({
        title: name,
        description,
        images: images.map((image) => ({
          bucket: 'pin-images',
          path: image.url,
        })),
        get_geojson: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        category_id: category,
        characteristics_ids: characteristics,
        location_id: location_id,
      })
      if (error) {
        throw new ActionError({
          message: error.message || 'Failed to add marker',
          code: error.code as ActionErrorCode
        })
      }
      return data
    } catch (error: any) {
      throw new ActionError({
        message: error.message || 'Failed to add marker',
        code: error.code as ActionErrorCode
      })
    }
  },
})  