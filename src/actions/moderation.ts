import { defineAction, ActionError, type ActionErrorCode } from 'astro:actions'
import { createClient } from '@/utils/supabase'
import { geographyPointEwkt } from '@/utils/geographyPointEwkt'
import { resourceSchema } from '@/schemas/resource.server'
import { z } from 'astro/zod'
import type { LocationInsert } from '@/types/database'
import type { SuggestedResource } from '@/types/domain/resource'
import { sendModerationEmail } from '@/utils/brevo'

function mapErrorCode(code?: string): ActionErrorCode {
  if (code === 'PGRST116') return 'NOT_FOUND'
  if (code === '42501') return 'FORBIDDEN'
  if (code === '23505') return 'CONFLICT'
  if (code === '23503' || code === '22P02') return 'BAD_REQUEST'
  return 'INTERNAL_SERVER_ERROR'
}

export const getSuggestedResources = defineAction({
  handler: async (_, { request, cookies }) => {
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

      const { data, error } = await supabase
        .from('suggested_pins')
        .select(`
          id,
          pin_id,
          status,
          title,
          description,
          images,
          category_id,
          characteristics_ids,
          coordinates: get_geojson,
          location_name,
          address,
          postal_code,
          email,
          phone,
          phone_area_code,
          access,
          accessibility,
          has_opening_hours,
          opening_hours,
          networks,
          created_by,
          created_at,
          updated_by,
          updated_at,
          users: created_by (
            email
          ),
          category: category_id (
            id,
            name,
            typology: typology_id (
              id,
              name
            )
          )
        `)
        .eq('status', 'standby')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[Action] getSuggestedResources error:', error)
        throw new ActionError({
          message: error.message || 'Failed to get suggested resources',
          code: mapErrorCode(error.code),
        })
      }

      const suggestedResources: SuggestedResource[] = (data || []).map((row: any) => ({
        suggestion_id: row.id,
        id: row.pin_id || row.id,
        pin_id: row.pin_id,
        title: row.title,
        description: row.description,
        images: row.images || [],
        category: row.category?.name || '',
        category_id: row.category_id,
        typology: row.category?.typology?.name || '',
        typology_id: row.category?.typology?.id || null,
        characteristics_ids: row.characteristics_ids || [],
        location: row.location_name || '',
        address: row.address || '',
        postal_code: row.postal_code || '',
        email: row.email || '',
        phone: row.phone || null,
        phone_area_code: row.phone_area_code || null,
        coordinates: row.coordinates,
        access: row.access || null,
        accessibility: row.accessibility ?? null,
        has_opening_hours: row.has_opening_hours ?? false,
        opening_hours: row.opening_hours || null,
        networks: row.networks || [],
        suggested_by_email: row.users?.email || null,
        status: row.status,
        created_at: row.created_at,
      }))

      return suggestedResources
    } catch (error: any) {
      if (error instanceof ActionError) throw error
      console.error('[Action] getSuggestedResources catch error:', error)
      throw new ActionError({
        message: error.message || 'Failed to get suggested resources',
        code: 'INTERNAL_SERVER_ERROR',
      })
    }
  },
})

export const getSuggestedResource = defineAction({
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

      const { data, error } = await supabase
        .from('suggested_pins')
        .select(`
          id,
          pin_id,
          status,
          title,
          description,
          images,
          category_id,
          characteristics_ids,
          coordinates: get_geojson,
          location_name,
          address,
          postal_code,
          email,
          phone,
          phone_area_code,
          access,
          accessibility,
          has_opening_hours,
          opening_hours,
          networks,
          created_by,
          created_at,
          updated_by,
          updated_at,
          users: created_by (
            email
          ),
          category: category_id (
            id,
            name,
            typology: typology_id (
              id,
              name
            )
          )
        `)
        .eq('id', input.id)
        .single()

      if (error || !data) {
        console.error('[Action] getSuggestedResource error:', error)
        throw new ActionError({
          message: error?.message || 'Suggested resource not found',
          code: mapErrorCode(error?.code),
        })
      }

      const row: any = data
      const suggestedResource: SuggestedResource = {
        suggestion_id: row.id,
        id: row.pin_id || row.id,
        pin_id: row.pin_id,
        title: row.title,
        description: row.description,
        images: row.images || [],
        category: row.category?.name || '',
        category_id: row.category_id,
        typology: row.category?.typology?.name || '',
        typology_id: row.category?.typology?.id || null,
        characteristics_ids: row.characteristics_ids || [],
        location: row.location_name || '',
        address: row.address || '',
        postal_code: row.postal_code || '',
        email: row.email || '',
        phone: row.phone || null,
        phone_area_code: row.phone_area_code || null,
        coordinates: row.coordinates,
        access: row.access || null,
        accessibility: row.accessibility ?? null,
        has_opening_hours: row.has_opening_hours ?? false,
        opening_hours: row.opening_hours || null,
        networks: row.networks || [],
        suggested_by_email: row.users?.email || null,
        status: row.status,
        created_at: row.created_at,
      }

      return suggestedResource
    } catch (error: any) {
      if (error instanceof ActionError) throw error
      console.error('[Action] getSuggestedResource catch error:', error)
      throw new ActionError({
        message: error.message || 'Failed to get suggested resource',
        code: 'INTERNAL_SERVER_ERROR',
      })
    }
  },
})

export const updateSuggestedResource = defineAction({
  input: resourceSchema.extend({
    suggestion_id: z.string(),
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

      const updateData: any = {
        title: input.title || '',
        description: input.description || '',
        images: input.images || [],
        category_id: input.category_id,
        characteristics_ids: input.characteristics_ids || [],
        location_name: input.location_name || '',
        address: input.address || '',
        postal_code: input.postal_code || '',
        email: input.email || '',
        phone: input.phone != null ? String(input.phone) : null,
        phone_area_code: input.phone_area_code != null ? Number(input.phone_area_code) : null,
        access: input.access || null,
        accessibility: input.accessibility ?? null,
        has_opening_hours: input.has_opening_hours ?? false,
        opening_hours: input.has_opening_hours ? ((input.opening_hours as any) || null) : null,
        networks: input.networks || [],
        status: 'standby', // Keeps standby status when edited
        updated_by: auth.user.id,
        updated_at: new Date().toISOString(),
      }

      if (input.coordinates?.latitude && input.coordinates?.longitude) {
        updateData.coordinates = geographyPointEwkt(
          Number(input.coordinates.longitude),
          Number(input.coordinates.latitude),
        )
      }

      const { error: updateError } = await supabase
        .from('suggested_pins')
        .update(updateData)
        .eq('id', input.suggestion_id)

      if (updateError) {
        console.error('[Action] updateSuggestedResource error:', updateError)
        throw new ActionError({
          message: updateError.message || 'Failed to update suggestion',
          code: mapErrorCode(updateError.code),
        })
      }

      return { success: true }
    } catch (error: any) {
      if (error instanceof ActionError) throw error
      console.error('[Action] updateSuggestedResource catch error:', error)
      throw new ActionError({
        message: error.message || 'Failed to update suggested resource',
        code: 'INTERNAL_SERVER_ERROR',
      })
    }
  },
})

export const acceptSuggestedResource = defineAction({
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

      // Fetch suggestion
      const { data: suggestion, error: fetchError } = await supabase
        .from('suggested_pins')
        .select('*')
        .eq('id', input.id)
        .single()

      if (fetchError || !suggestion) {
        throw new ActionError({
          message: 'Suggested resource not found',
          code: 'NOT_FOUND',
        })
      }

      const isEdit = !!suggestion.pin_id

      if (isEdit) {
        // 1. Existing Pin Edition
        const { data: existingPin, error: pinFetchError } = await supabase
          .from('pins')
          .select('id, location_id')
          .eq('id', suggestion.pin_id)
          .single()

        if (pinFetchError || !existingPin) {
          throw new ActionError({
            message: 'Original resource not found to update',
            code: 'NOT_FOUND',
          })
        }

        // Update location
        const locationUpdate = {
          name: suggestion.location_name || '',
          address: suggestion.address || '',
          postal_code: suggestion.postal_code || '',
          coordinates: suggestion.coordinates,
          email: suggestion.email || '',
          phone: suggestion.phone || null,
          phone_area_code: suggestion.phone_area_code || null,
          access: suggestion.access || null,
          accessibility: suggestion.accessibility ?? null,
          has_opening_hours: suggestion.has_opening_hours ?? false,
          opening_hours: suggestion.opening_hours || null,
        }

        const { error: locationUpdateError } = await supabase
          .from('locations')
          .update(locationUpdate)
          .eq('id', existingPin.location_id)

        if (locationUpdateError) {
          console.error('[Action] acceptSuggestedResource location update error:', locationUpdateError)
          throw new ActionError({
            message: locationUpdateError.message || 'Failed to update location',
            code: 'INTERNAL_SERVER_ERROR',
          })
        }

        // Update networks
        await supabase.from('location_networks').delete().eq('location_id', existingPin.location_id)
        const networks = (suggestion.networks as any[]) || []
        if (networks.length > 0) {
          const { data: dbNetworks } = await supabase.from('networks').select('id, slug')
          if (dbNetworks) {
            const networksToInsert = networks.map((net: any) => {
              const dbNet = dbNetworks.find(d => d.slug === net.slug)
              if (dbNet) {
                return {
                  location_id: existingPin.location_id,
                  network_id: dbNet.id,
                  value: net.value,
                }
              }
              return null
            }).filter(Boolean) as { location_id: string; network_id: string; value: string }[]

            if (networksToInsert.length > 0) {
              await supabase.from('location_networks').insert(networksToInsert)
            }
          }
        }

        // Update pin
        const { error: pinUpdateError } = await supabase
          .from('pins')
          .update({
            title: suggestion.title || '',
            description: suggestion.description || '',
            images: suggestion.images || [],
            coordinates: suggestion.coordinates,
            category_id: suggestion.category_id,
            characteristics_ids: suggestion.characteristics_ids || [],
            updated_by: suggestion.created_by,
            accepted_by: auth.user.id,
            updated_date: new Date().toISOString(),
          })
          .eq('id', existingPin.id)

        if (pinUpdateError) {
          console.error('[Action] acceptSuggestedResource pin update error:', pinUpdateError)
          throw new ActionError({
            message: pinUpdateError.message || 'Failed to update resource',
            code: 'INTERNAL_SERVER_ERROR',
          })
        }

      } else {
        // 2. New Resource Creation
        const locationInsert: LocationInsert = {
          name: suggestion.location_name || '',
          address: suggestion.address || '',
          postal_code: suggestion.postal_code || '',
          coordinates: suggestion.coordinates,
          email: suggestion.email || '',
          phone: suggestion.phone || null,
          phone_area_code: suggestion.phone_area_code || null,
          access: suggestion.access || null,
          accessibility: suggestion.accessibility ?? null,
          has_opening_hours: suggestion.has_opening_hours ?? false,
          opening_hours: suggestion.opening_hours || null,
        }

        const { data: locationData, error: locationError } = await supabase
          .from('locations')
          .insert(locationInsert)
          .select('id')
          .single()

        if (locationError || !locationData?.id) {
          console.error('[Action] acceptSuggestedResource location insert error:', locationError)
          throw new ActionError({
            message: locationError?.message || 'Failed to create location',
            code: 'INTERNAL_SERVER_ERROR',
          })
        }

        // Insert networks
        const networks = (suggestion.networks as any[]) || []
        if (networks.length > 0) {
          const { data: dbNetworks } = await supabase.from('networks').select('id, slug')
          if (dbNetworks) {
            const networksToInsert = networks.map((net: any) => {
              const dbNet = dbNetworks.find(d => d.slug === net.slug)
              if (dbNet) {
                return {
                  location_id: locationData.id,
                  network_id: dbNet.id,
                  value: net.value,
                }
              }
              return null
            }).filter(Boolean) as { location_id: string; network_id: string; value: string }[]

            if (networksToInsert.length > 0) {
              await supabase.from('location_networks').insert(networksToInsert)
            }
          }
        }

        // Insert pin
        const { error: pinInsertError } = await supabase
          .from('pins')
          .insert({
            title: suggestion.title || '',
            description: suggestion.description || '',
            images: suggestion.images || [],
            coordinates: suggestion.coordinates,
            category_id: suggestion.category_id,
            characteristics_ids: suggestion.characteristics_ids || [],
            location_id: locationData.id,
            created_by: suggestion.created_by,
            accepted_by: auth.user.id,
            status: 'approved',
          })

        if (pinInsertError) {
          console.error('[Action] acceptSuggestedResource pin insert error:', pinInsertError)
          throw new ActionError({
            message: pinInsertError.message || 'Failed to create pin',
            code: 'INTERNAL_SERVER_ERROR',
          })
        }
      }

      // 3. Remove suggestion from suggested_pins
      const { error: deleteError } = await supabase
        .from('suggested_pins')
        .delete()
        .eq('id', input.id)

      if (deleteError) {
        console.error('[Action] acceptSuggestedResource delete error:', deleteError)
      }

      // 4. Send email notification to the submitter
      try {
        const { data: creatorUser } = await supabase
          .from('users')
          .select('email')
          .eq('id', suggestion.created_by)
          .single()

        if (creatorUser?.email) {
          sendModerationEmail({
            toEmail: creatorUser.email,
            resourceTitle: suggestion.title,
            status: 'accepted',
          }).catch((emailErr) => console.error('[Action] Error sending acceptance email:', emailErr))
        }
      } catch (emailErr) {
        console.error('[Action] Failed to lookup creator email:', emailErr)
      }

      return { success: true }
    } catch (error: any) {
      if (error instanceof ActionError) throw error
      console.error('[Action] acceptSuggestedResource catch error:', error)
      throw new ActionError({
        message: error.message || 'Failed to accept suggested resource',
        code: 'INTERNAL_SERVER_ERROR',
      })
    }
  },
})

export const rejectSuggestedResource = defineAction({
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

      // Fetch suggestion to clean up any uploaded images and notify submitter
      const { data: suggestion } = await supabase
        .from('suggested_pins')
        .select('title, images, pin_id, created_by')
        .eq('id', input.id)
        .single()

      // If it's a new pin suggestion (not editing an existing one), clean up uploaded images from storage
      if (suggestion && !suggestion.pin_id && Array.isArray(suggestion.images)) {
        const imagePaths = suggestion.images
          .map((img: any) => img?.url)
          .filter((url: any) => typeof url === 'string' && !url.startsWith('http'))

        if (imagePaths.length > 0) {
          try {
            await supabase.storage.from('pin-images').remove(imagePaths)
          } catch (storageErr) {
            console.error('[Action] Error cleaning up rejected suggestion images:', storageErr)
          }
        }
      }

      // Fetch submitter's email before deleting
      let submitterEmail = ''
      if (suggestion?.created_by) {
        try {
          const { data: creatorUser } = await supabase
            .from('users')
            .select('email')
            .eq('id', suggestion.created_by)
            .single()
          submitterEmail = creatorUser?.email || ''
        } catch (creatorErr) {
          console.error('[Action] Failed to lookup creator email for rejection:', creatorErr)
        }
      }

      // Delete from suggested_pins
      const { error: deleteError } = await supabase
        .from('suggested_pins')
        .delete()
        .eq('id', input.id)

      if (deleteError) {
        console.error('[Action] rejectSuggestedResource delete error:', deleteError)
        throw new ActionError({
          message: deleteError.message || 'Failed to reject suggested resource',
          code: mapErrorCode(deleteError.code),
        })
      }

      // Send email notification to submitter
      if (submitterEmail && suggestion?.title) {
        sendModerationEmail({
          toEmail: submitterEmail,
          resourceTitle: suggestion.title,
          status: 'rejected',
        }).catch((emailErr) => console.error('[Action] Error sending rejection email:', emailErr))
      }

      return { success: true }
    } catch (error: any) {
      if (error instanceof ActionError) throw error
      console.error('[Action] rejectSuggestedResource catch error:', error)
      throw new ActionError({
        message: error.message || 'Failed to reject suggested resource',
        code: 'INTERNAL_SERVER_ERROR',
      })
    }
  },
})

