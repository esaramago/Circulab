import { defineAction, ActionError, type ActionErrorCode } from 'astro:actions'
import { createClient, supabase } from '@/utils/supabase'
import { PIN_STATUS } from '@/types/database'
import type { LocationInsert, ResourceRow } from '@/types/database'
import type { Pin } from '@/types/domain/resource'
import type { ResourceType } from '@/schemas/resource.server'
import { geographyPointEwkt } from '@/utils/geographyPointEwkt'
import { resourceSchema } from '@/schemas/resource.server'
import { z } from 'astro/zod'
import geojson from '@/utils/geojson'

export const getPins = defineAction({
  handler: async () => {
    try {
      const { data, error } = await supabase.from('pins').select(`
        id,
        title,
        category_id,
        coordinates: get_geojson,
        categories (
          typology_id
        )
      `).or(`status.is.null,status.eq.${PIN_STATUS.APPROVED}`) // only status that are null or 'approved'
      if (error) {
        throw new ActionError({
          message: error.message || 'Failed to get pins',
          code: error.code as ActionErrorCode
        })
      }

      const pins = [] as Pin[]

      data.forEach((pin) => {
        pins.push({
          id: pin.id,
          title: pin.title,
          coordinates: {
            latitude: geojson.getLatitude(pin.coordinates) ,
            longitude: geojson.getLongitude(pin.coordinates) ,
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

export const getResource = defineAction({
  input: z.object({
    id: z.string(),
  }),
  handler: async (input: { id: string }) => {
    try {
      const { data, error } = await supabase.from('pins').select(`
        id,
        title,
        description,
        images,
        category: category_id (
          name,
          typology: typology_id (
            name
          )
        ),
        location: locations (
          name,
          address,
          postal_code,
          email,
          phone
        ),
        coordinates: get_geojson
      `).eq('id', input.id).single()

      if (error) {
        throw new ActionError({
          message: error.message || 'Failed to get pin',
          code: error.code as ActionErrorCode
        })
      }

      const resource = {
        id: data.id,
        title: data.title,
        description: data.description,
        images: data.images,
        category: data.category.name,
        typology: data.category.typology.name,
        //characteristics: data.characteristics,
        location: data.location.name,
        address: data.location.address,
        postal_code: data.location.postal_code,
        email: data.location.email,
        phone: data.location.phone,
        coordinates: data.coordinates,
      }

      return resource
    } catch (error: any) {
      throw new ActionError({
        message: error.message || 'Failed to get resource',
        code: error.code as ActionErrorCode
      })
    }
  },
})

export const getResources = defineAction({
  handler: async () => {
    try {
      const { data, error } = await supabase.from('pins').select(`
        id,
        title,
        description,
        images,
        category_id,
        characteristics_ids,
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

      return data as ResourceRow[]
    } catch (error: any) {
      throw new ActionError({
        message: error.message || 'Failed to get resources',
        code: error.code as ActionErrorCode
      })
    }
  },
})

export const addResource = defineAction({
  input: resourceSchema,
  handler: async (input: ResourceType, { request, cookies }) => {

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
        message: error.message || 'Failed to add resource',
        code: error.code as ActionErrorCode
      })
    }
  },
})
