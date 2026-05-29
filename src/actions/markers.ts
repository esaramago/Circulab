import { defineAction, ActionError, type ActionErrorCode } from 'astro:actions'
import { createClient, supabase } from '@/utils/supabase'
import type { LocationInsert, MapPinRow, MarkerType, MapPin } from '@/types/data'
import { geographyPointEwkt } from '@/utils/geographyPointEwkt'
import { markerSchema } from '@/schemas/marker.server'


export const getMapPins = defineAction({
  handler: async () => {
    try {
      const { data, error } = await supabase.from('pins').select(`
        id,
        title,
        category_id,
        get_geojson,
        categories (
          typology_id
        )
      `)
      if (error) {
        throw new ActionError({
          message: error.message || 'Failed to get pins',
          code: error.code as ActionErrorCode
        })
      }

      const pins = [] as MapPin[]

      data.forEach((rawPin) => {
        const pin = rawPin as MapPinRow
        pins.push({
          id: pin.id,
          title: pin.title,
          coordinates: {
            latitude: pin.get_geojson?.coordinates[1] ?? 0,
            longitude: pin.get_geojson?.coordinates[0] ?? 0,
          },
          category_id: pin.category_id,
          typology_id: pin.categories.typology_id,
        })
      })

      return pins


    } catch (error: any) {
      throw new ActionError({
        message: error.message || 'Failed to get public user',
        code: error.code as ActionErrorCode
      })
    }
  },
})

export const getMarkers = defineAction({
  handler: async () => {
    try {
      const { data, error } = await supabase.from('pins').select(`
        id,
        title,
        category_id,
        get_geojson,
        location_id,
        locations (
          name,
          address,
          postal_code,
          email,
          phone
        ),
        categories (
          typology_id
        )
      `)
      if (error) {
        throw new ActionError({
          message: error.message || 'Failed to get pins',
          code: error.code as ActionErrorCode
        })
      }

      return data
    } catch (error: any) {
      throw new ActionError({
        message: error.message || 'Failed to get markers',
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
