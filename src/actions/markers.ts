import { defineAction, ActionError, type ActionErrorCode } from 'astro:actions'
import { fetchDB } from '@/utils/fetchDB'
import { createClient } from '@/utils/supabase'
import {
  pointCoordinates,
  type GeoJsonPoint,
  type ImageType,
  type LocationInsert, type PinRow,
} from '@/types/data'
import { geographyPointEwkt } from '@/utils/geographyPointEwkt'
import { markerSchema } from '@/schemas/marker.server'
import type { MarkerType } from '@/types/data'

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

      const markers = data.map((marker: PinRow) => ({
        accepted_by: marker.accepted_by,
        category_id: marker.category_id,
        characteristics_ids: marker.characteristics_ids,
        coordinates: marker.coordinates,
        created_by: marker.created_by,
        created_date: marker.created_date,
        description: marker.description,
        id: marker.id,
        images: marker.images,
        location_id: marker.location_id,
        title: marker.title,
        updated_by: marker.updated_by,
        updated_date: marker.updated_date,
      }))

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
  input: markerSchema,
  handler: async (input: MarkerType, { request, cookies }) => {

    try {
      const supabase = createClient({ request, cookies })
      const { data: auth, error: authError } = await supabase.auth.getUser()

      if (authError || !auth.user) {
        throw new ActionError({
          message: 'Not authenticated',
          code: 'UNAUTHORIZED',
        })
      }

      const locationInsert: LocationInsert = {
        name: input.location_name || '',
        address: input.address || '',
        postal_code: input.postal_code || '',
        location: input.location || null,
        coordinates: geographyPointEwkt(
          Number(input.coordinates.longitude),
          Number(input.coordinates.latitude),
        ),
        email: input.email || '',
        phone: input.phone != null ? String(input.phone) : null,
      }

      const { data: locationsData, error: locationsError } = await supabase
        .from('locations')
        .insert(locationInsert)
        .select('id')
        .single()

      if (!locationsData?.id) {
        throw new ActionError({
          message: locationsError?.message || 'Failed to add location',
          code: locationsError?.code as ActionErrorCode
        })
      }

      const { data: pinsData, error: pinsError } = await supabase.from('pins').insert({
        title: input.title || '',
        description: input.description || '',
        images: [],
        coordinates: geographyPointEwkt(
          Number(input.coordinates.longitude),
          Number(input.coordinates.latitude),
        ),
        category_id: input.category_id,
        characteristics_ids: input.characteristics_ids,
        location_id: locationsData.id,
        created_by: auth.user.id,
      }).select('id').single()

      if (!pinsData?.id) {
        throw new ActionError({
          message: pinsError?.message || 'Failed to add pin',
          code: pinsError?.code as ActionErrorCode,
        })
      }

    } catch (error: any) {
      throw new ActionError({
        message: error.message || 'Failed to add marker',
        code: error.code as ActionErrorCode
      })
    }
  },
})
