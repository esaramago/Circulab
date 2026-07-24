import { defineAction, ActionError, type ActionErrorCode } from 'astro:actions'
import { createClient, supabase } from '@/utils/supabase'
import { PIN_STATUS } from '@/types/database'
import type { LocationInsert, ResourceRow } from '@/types/database'
import type { Pin } from '@/types/domain/resource'
import type { Resource } from '@/types/domain/resource'
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
          icon,
          name,
          color,
          typology_id,
          typology: typology_id (
            color,
            name,
            has_category_color
          )
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
        const hasCategoryColor = pin.categories?.typology?.has_category_color !== false
        pins.push({
          id: pin.id,
          title: pin.title,
          coordinates: {
            latitude: geojson.getLatitude(pin.coordinates) ,
            longitude: geojson.getLongitude(pin.coordinates) ,
          },
          category: pin.categories.name,
          typology: pin.categories.typology.name,
          category_id: pin.category_id,
          typology_id: pin.categories.typology_id,
          color: (hasCategoryColor && pin.categories?.color) ? pin.categories.color : (pin.categories?.typology?.color ?? null),
          category_color: (hasCategoryColor && pin.categories?.color) ? pin.categories.color : null,
          typology_color: pin.categories?.typology?.color ?? null,
          icon: pin.categories?.icon ?? null,
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
        category_id,
        characteristics_ids,
        category: category_id (
          id,
          name,
          typology: typology_id (
            id,
            name
          )
        ),
        location: locations (
          id,
          name,
          address,
          postal_code,
          email,
          phone,
          phone_area_code
        ),
        coordinates: get_geojson
      `).eq('id', input.id).single()

      if (error) {
        throw new ActionError({
          message: error.message || 'Failed to get pin',
          code: error.code as ActionErrorCode
        })
      }

      console.log('[Action] getResource raw data:', JSON.stringify(data))

      const resource = {
        id: data.id,
        title: data.title,
        description: data.description,
        images: data.images,
        category: data.category?.name || '',
        category_id: data.category?.id || null,
        typology: data.category?.typology?.name || '',
        typology_id: data.category?.typology?.id || null,
        characteristics_ids: data.characteristics_ids || [],
        location: data.location?.name || '',
        location_id: data.location?.id || '',
        address: data.location?.address || '',
        postal_code: data.location?.postal_code || '',
        email: data.location?.email || '',
        phone: data.location?.phone || null,
        phone_area_code: data.location?.phone_area_code || null,
        coordinates: data.coordinates,
      }

      console.log('[Action] getResource mapped resource:', JSON.stringify(resource))

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
        ),
        status
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
  handler: async (input: Resource, { request, cookies }) => {

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
          Number(input.coordinates?.longitude),
          Number(input.coordinates?.latitude),
        ),
        email: input.email || '',
        phone: input.phone != null ? String(input.phone) : null,
        phone_area_code: input.phone_area_code || null,
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
        id: input.id,
        title: input.title || '',
        description: input.description || '',
        images: input.images || [],
        coordinates: geographyPointEwkt(
          Number(input.coordinates?.longitude),
          Number(input.coordinates?.latitude),
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

export const deleteResource = defineAction({
  input: z.object({
    id: z.string(),
  }),
  handler: async (input: { id: string }, { request, cookies }) => {
    try {
      const supabase = createClient({ request, cookies })
      const { data: auth, error: authError } = await supabase.auth.getUser()

      if (authError || !auth.user) {
        throw new ActionError({
          message: 'Not authenticated',
          code: 'UNAUTHORIZED',
        })
      }

      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*, roles(*)')
        .eq('id', auth.user.id)
        .single()

      if (profileError || !['admin', 'moderator'].includes(userProfile?.roles?.code || '')) {
        throw new ActionError({
          message: 'Not authorized',
          code: 'UNAUTHORIZED',
        })
      }

      const { error, count } = await supabase
        .from('pins')
        .delete({ count: 'exact' })
        .eq('id', input.id)

      if (error) {
        throw new ActionError({
          message: error.message || 'Failed to delete resource',
          code: error.code as ActionErrorCode,
        })
      }

      if (count === 0) {
        throw new ActionError({
          message: 'Resource not found or you do not have permission to delete it.',
          code: 'NOT_FOUND',
        })
      }

      return { success: true }
    } catch (error: any) {
      if (error instanceof ActionError) throw error
      throw new ActionError({
        message: error.message || 'Failed to delete resource',
        code: 'INTERNAL_SERVER_ERROR',
      })
    }
  },
})

export const editResource = defineAction({
  input: resourceSchema.extend({
    id: z.string(),
  }),
  handler: async (input, { request, cookies }) => {
    try {
      const supabase = createClient({ request, cookies })
      const { data: auth, error: authError } = await supabase.auth.getUser()

      if (authError || !auth.user) {
        throw new ActionError({
          message: 'Not authenticated',
          code: 'UNAUTHORIZED',
        })
      }

      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*, roles(*)')
        .eq('id', auth.user.id)
        .single()

      if (profileError || !['admin', 'moderator'].includes(userProfile?.roles?.code || '')) {
        throw new ActionError({
          message: 'Not authorized',
          code: 'UNAUTHORIZED',
        })
      }

      // 1. Get the existing pin to find its location_id
      const { data: existingPin, error: pinFetchError } = await supabase
        .from('pins')
        .select('location_id')
        .eq('id', input.id)
        .single()

      if (pinFetchError || !existingPin) {
        throw new ActionError({
          message: pinFetchError?.message || 'Resource not found',
          code: 'NOT_FOUND',
        })
      }

      // 2. Update the location
      const locationUpdate = {
        name: input.location_name || '',
        address: input.address || '',
        postal_code: input.postal_code || '',
        location: input.location || null,
        coordinates: geographyPointEwkt(
          Number(input.coordinates?.longitude),
          Number(input.coordinates?.latitude),
        ),
        email: input.email || '',
        phone: input.phone != null ? String(input.phone) : null,
        phone_area_code: input.phone_area_code || null,
      }

      const { error: locationUpdateError } = await supabase
        .from('locations')
        .update(locationUpdate)
        .eq('id', existingPin.location_id)

      if (locationUpdateError) {
        throw new ActionError({
          message: locationUpdateError.message || 'Failed to update location',
          code: 'INTERNAL_SERVER_ERROR',
        })
      }

      // 3. Update the pin
      const { error: pinUpdateError } = await supabase
        .from('pins')
        .update({
          title: input.title || '',
          description: input.description || '',
          images: input.images || [],
          coordinates: geographyPointEwkt(
            Number(input.coordinates?.longitude),
            Number(input.coordinates?.latitude),
          ),
          category_id: input.category_id,
          characteristics_ids: input.characteristics_ids,
          updated_by: auth.user.id,
          updated_date: new Date().toISOString(),
        })
        .eq('id', input.id)

      if (pinUpdateError) {
        throw new ActionError({
          message: pinUpdateError.message || 'Failed to update resource',
          code: 'INTERNAL_SERVER_ERROR',
        })
      }

      return { success: true }
    } catch (error: any) {
      if (error instanceof ActionError) throw error
      throw new ActionError({
        message: error.message || 'Failed to edit resource',
        code: 'INTERNAL_SERVER_ERROR',
      })
    }
  },
})

