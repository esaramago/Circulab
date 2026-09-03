import { defineAction, ActionError, type ActionErrorCode } from 'astro:actions'
import { createClient, supabase } from '@/utils/supabase'
import { PIN_STATUS } from '@/types/database'
import type { LocationInsert, ResourceRow } from '@/types/database'
import type { FullResource, Pin } from '@/types/domain/resource'
import type { Resource } from '@/types/domain/resource'
import { geographyPointEwkt } from '@/utils/geographyPointEwkt'
import { resourceSchema } from '@/schemas/resource.server'
import { z } from 'astro/zod'
import geojson from '@/utils/geojson'

function mapErrorCode(code?: string): ActionErrorCode {
  if (code === 'PGRST116') return 'NOT_FOUND'
  if (code === '42501') return 'FORBIDDEN'
  if (code === '23505') return 'CONFLICT'
  if (code === '23503' || code === '22P02') return 'BAD_REQUEST'
  return 'INTERNAL_SERVER_ERROR'
}

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
        console.error('[Action] getPins error from Supabase:', error)
        throw new ActionError({
          message: error.message || 'Failed to get pins',
          code: mapErrorCode(error.code)
        })
      }

      const pins = [] as Pin[]

      data?.forEach((pin) => {
        const hasCategoryColor = pin.categories?.typology?.has_category_color !== false
        pins.push({
          id: pin.id,
          title: pin.title,
          coordinates: {
            latitude: geojson.getLatitude(pin.coordinates),
            longitude: geojson.getLongitude(pin.coordinates),
          },
          category: pin.categories?.name,
          typology: pin.categories?.typology?.name,
          category_id: pin.category_id,
          typology_id: pin.categories?.typology_id,
          color: (hasCategoryColor && pin.categories?.color) ? pin.categories.color : (pin.categories?.typology?.color ?? null),
          category_color: (hasCategoryColor && pin.categories?.color) ? pin.categories.color : null,
          typology_color: pin.categories?.typology?.color ?? null,
          icon: pin.categories?.icon ?? null,
        })
      })

      return pins

    } catch (error: any) {
      if (error instanceof ActionError) throw error
      console.error('[Action] getPins catch error:', error)
      throw new ActionError({
        message: error.message || 'Failed to get pins',
        code: 'INTERNAL_SERVER_ERROR'
      })
    }
  },
})

export const getResource = defineAction({
  input: z.object({
    id: z.string(),
  }),
  handler: async (input: { id: string }) => {


    debugger
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
          phone_area_code,
          accessibility,
          has_opening_hours,
          opening_hours,
          location_networks (
            value,
            networks (
              id,
              name,
              slug,
              icon
            )
          )
        ),
        coordinates: get_geojson
      `).eq('id', input.id).single()

      if (error) {
        console.error('[Action] getResource error from Supabase:', error)
        throw new ActionError({
          message: error.message || 'Failed to get pin',
          code: mapErrorCode(error.code)
        })
      }

      const locationNetworks = (data.location?.location_networks as any[]) || []
      const networks = locationNetworks.map((ln: any) => ({
        slug: ln.networks?.slug || '',
        name: ln.networks?.name || '',
        value: ln.value || '',
        icon: ln.networks?.icon || null,
      })).filter((n) => n.slug)

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
        accessibility: data.location?.accessibility || null,
        has_opening_hours: data.location?.has_opening_hours ?? false,
        opening_hours: (data.location?.opening_hours as any) || null,
        networks,
      }

      return resource
    } catch (error: any) {
      if (error instanceof ActionError) throw error
      console.error('[Action] getResource catch error:', error)
      throw new ActionError({
        message: error.message || 'Failed to get resource',
        code: 'INTERNAL_SERVER_ERROR'
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
        console.error('[Action] getResources error from Supabase:', error)
        throw new ActionError({
          message: error.message || 'Failed to get pins',
          code: mapErrorCode(error.code)
        })
      }

      return data as ResourceRow[]
    } catch (error: any) {
      if (error instanceof ActionError) throw error
      console.error('[Action] getResources catch error:', error)
      throw new ActionError({
        message: error.message || 'Failed to get resources',
        code: 'INTERNAL_SERVER_ERROR'
      })
    }
  },
})

export const getFullResources = defineAction({
  handler: async () => {
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
          phone_area_code,
          accessibility,
          has_opening_hours,
          opening_hours
        ),
        coordinates: get_geojson,
        status
      `)

      if (error) {
        console.error('[Action] getFullResources error from Supabase:', error)
        throw new ActionError({
          message: error.message || 'Failed to get pins',
          code: mapErrorCode(error.code)
        })
      }

      const fullResourses = data?.map((resource: any) => ({
        id: resource.id,
        title: resource.title,
        description: resource.description,
        images: resource.images,
        category: resource.category?.name || '',
        category_id: resource.category?.id || null,
        typology: resource.category?.typology?.name || '',
        typology_id: resource.category?.typology?.id || null,
        characteristics_ids: resource.characteristics_ids || [],
        location: resource.location?.name || '',
        location_id: resource.location?.id || '',
        address: resource.location?.address || '',
        postal_code: resource.location?.postal_code || '',
        email: resource.location?.email || '',
        phone: resource.location?.phone || null,
        phone_area_code: resource.location?.phone_area_code || null,
        coordinates: resource.coordinates,
        accessibility: resource.location?.accessibility || null,
        has_opening_hours: resource.location?.has_opening_hours ?? false,
        opening_hours: (resource.location?.opening_hours as any) || null,
        status: resource.status,
      }))

      return fullResourses as FullResource[]
    } catch (error: any) {
      if (error instanceof ActionError) throw error
      console.error('[Action] getFullResources catch error:', error)
      throw new ActionError({
        message: error.message || 'Failed to get resources',
        code: 'INTERNAL_SERVER_ERROR'
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
        coordinates: geographyPointEwkt(
          Number(input.coordinates?.longitude),
          Number(input.coordinates?.latitude),
        ),
        email: input.email || '',
        phone: input.phone != null ? String(input.phone) : null,
        phone_area_code: input.phone_area_code || null,
        accessibility: input.accessibility || null,
        has_opening_hours: input.has_opening_hours ?? false,
        opening_hours: input.has_opening_hours ? ((input.opening_hours as any) || null) : null,
      }

      const { data: locationsData, error: locationsError } = await supabase
        .from('locations')
        .insert(locationInsert)
        .select('id')
        .single()

      if (!locationsData?.id) {
        console.error('[Action] addResource locations error:', locationsError)
        throw new ActionError({
          message: locationsError?.message || 'Failed to add location',
          code: mapErrorCode(locationsError?.code)
        })
      }

      if (input.networks && input.networks.length > 0) {
        const { data: dbNetworks } = await supabase.from('networks').select('id, slug')
        if (dbNetworks) {
          const networksToInsert = input.networks.map(net => {
            const dbNet = dbNetworks.find(d => d.slug === net.slug)
            if (dbNet) {
              return {
                location_id: locationsData.id,
                network_id: dbNet.id,
                value: net.value
              }
            }
            return null
          }).filter(Boolean) as { location_id: string; network_id: string; value: string }[]

          if (networksToInsert.length > 0) {
            const { error: netError } = await supabase.from('location_networks').insert(networksToInsert)
            if (netError) {
              console.error('Failed to insert location networks:', netError)
            }
          }
        }
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
        console.error('[Action] addResource pins error:', pinsError)
        throw new ActionError({
          message: pinsError?.message || 'Failed to add pin',
          code: mapErrorCode(pinsError?.code),
        })
      }

    } catch (error: any) {
      if (error instanceof ActionError) throw error
      console.error('[Action] addResource catch error:', error)
      throw new ActionError({
        message: error.message || 'Failed to add resource',
        code: 'INTERNAL_SERVER_ERROR'
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
        console.error('[Action] deleteResource error:', error)
        throw new ActionError({
          message: error.message || 'Failed to delete resource',
          code: mapErrorCode(error.code),
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
      console.error('[Action] deleteResource catch error:', error)
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
        coordinates: geographyPointEwkt(
          Number(input.coordinates?.longitude),
          Number(input.coordinates?.latitude),
        ),
        email: input.email || '',
        phone: input.phone != null ? String(input.phone) : null,
        phone_area_code: input.phone_area_code || null,
        accessibility: input.accessibility || null,
        has_opening_hours: input.has_opening_hours ?? false,
        opening_hours: input.has_opening_hours ? ((input.opening_hours as any) || null) : null,
      }

      const { error: locationUpdateError } = await supabase
        .from('locations')
        .update(locationUpdate)
        .eq('id', existingPin.location_id)

      if (locationUpdateError) {
        console.error('[Action] editResource location error:', locationUpdateError)
        throw new ActionError({
          message: locationUpdateError.message || 'Failed to update location',
          code: 'INTERNAL_SERVER_ERROR',
        })
      }

      // Update networks
      await supabase.from('location_networks').delete().eq('location_id', existingPin.location_id)

      if (input.networks && input.networks.length > 0) {
        const { data: dbNetworks } = await supabase.from('networks').select('id, slug')
        if (dbNetworks) {
          const networksToInsert = input.networks.map(net => {
            const dbNet = dbNetworks.find(d => d.slug === net.slug)
            if (dbNet) {
              return {
                location_id: existingPin.location_id,
                network_id: dbNet.id,
                value: net.value
              }
            }
            return null
          }).filter(Boolean) as { location_id: string; network_id: string; value: string }[]

          if (networksToInsert.length > 0) {
            const { error: netError } = await supabase.from('location_networks').insert(networksToInsert)
            if (netError) {
              console.error('Failed to update location networks:', netError)
            }
          }
        }
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
        console.error('[Action] editResource pin error:', pinUpdateError)
        throw new ActionError({
          message: pinUpdateError.message || 'Failed to update resource',
          code: 'INTERNAL_SERVER_ERROR',
        })
      }

      return { success: true }
    } catch (error: any) {
      if (error instanceof ActionError) throw error
      console.error('[Action] editResource catch error:', error)
      throw new ActionError({
        message: error.message || 'Failed to edit resource',
        code: 'INTERNAL_SERVER_ERROR',
      })
    }
  },
})

export const getNetworks = defineAction({
  handler: async () => {
    try {
      const { data, error } = await supabase.from('networks').select('id, name, slug, icon')
      if (error) {
        console.error('[Action] getNetworks error:', error)
        throw new ActionError({
          message: error.message || 'Failed to get networks',
          code: mapErrorCode(error.code)
        })
      }
      if (!data || data.length === 0) {
        return [
          { id: '1', name: 'Website', slug: 'website', icon: 'globe' },
          { id: '2', name: 'Instagram', slug: 'instagram', icon: 'instagram' },
          { id: '3', name: 'Facebook', slug: 'facebook', icon: 'facebook' }
        ]
      }
      return data
    } catch (error: any) {
      if (error instanceof ActionError) throw error
      console.error('[Action] getNetworks catch error:', error)
      throw new ActionError({
        message: error.message || 'Failed to get networks',
        code: 'INTERNAL_SERVER_ERROR'
      })
    }
  }
})
