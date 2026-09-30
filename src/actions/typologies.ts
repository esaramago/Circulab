import { defineAction, ActionError, type ActionErrorCode } from 'astro:actions'
import { createClient } from '@/utils/supabase'
import { updateTypologySchema } from '@/schemas/typology.server'
import { z } from 'astro/zod'
import { m } from '@/paraglide/messages.js'

export const updateTypology = defineAction({
  input: z.any(),
  handler: async (rawInput, { request, cookies, locals }) => {
    const result = updateTypologySchema.safeParse(rawInput)
    if (!result.success) {
      console.error('[Actions] updateTypology validation failed:', result.error.format())
      throw new ActionError({
        message: 'Não foi possível atualizar a tipologia.',
        code: 'BAD_REQUEST'
      })
    }
    const input = result.data
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

      if (profileError || userProfile?.roles?.code !== 'admin') {
        throw new ActionError({
          message: 'Not authorized as admin',
          code: 'UNAUTHORIZED',
        })
      }

      const { data, error } = await supabase
        .from('typologies')
        .update({
          name: input.name as any,
          description: (input.description || null) as any,
          color: input.color || null,
          has_category_color: input.has_category_color ?? true,
          icon: input.icon || null
        })
        .eq('id', input.id)
        .select('*')
        .single()

      if (error) {
        let code: ActionErrorCode = 'INTERNAL_SERVER_ERROR'
        if (error.code === '42501') code = 'FORBIDDEN'
        else if (error.code === 'PGRST116') code = 'NOT_FOUND'
        else if (error.code === '23505') code = 'CONFLICT'

        throw new ActionError({
          message: error.message || m['backoffice.failed_update_typology']({}, { locale: locals?.locale }),
          code
        })
      }

      return { success: true, typology: data }

    } catch (error: any) {
      if (error instanceof ActionError) throw error
      throw new ActionError({
        message: error.message || m['common.internal_server_error']({}, { locale: locals?.locale }),
        code: 'INTERNAL_SERVER_ERROR'
      })
    }
  }
})

export const getTypologies = defineAction({
  handler: async (_, { request, cookies, locals }) => {
    try {
      const supabase = createClient({ request, cookies })
      
      const { data, error } = await supabase
        .from('typologies')
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        throw new ActionError({
          message: 'Failed to get typologies',
          code: 'INTERNAL_SERVER_ERROR'
        })
      }

      return { success: true, typologies: data }

    } catch (error: any) {
      if (error instanceof ActionError) throw error
      throw new ActionError({
        message: error.message || m['common.internal_server_error']({}, { locale: locals?.locale }),
        code: 'INTERNAL_SERVER_ERROR'
      })
    }
  }
})

export const getTypologyById = defineAction({
  input: z.object({
    id: z.string().min(1)
  }),
  handler: async (input, { request, cookies, locals }) => {
    try {
      const supabase = createClient({ request, cookies })
      
      const { data, error } = await supabase.from('typologies').select('*').eq('id', input.id).single()

      if (error) {
        throw new ActionError({
          message: 'Failed to get typology',
          code: 'INTERNAL_SERVER_ERROR'
        })
      }

      return { success: true, typology: data }

    } catch (error: any) {
      if (error instanceof ActionError) throw error
      throw new ActionError({
        message: error.message || m['common.internal_server_error']({}, { locale: locals?.locale }),
        code: 'INTERNAL_SERVER_ERROR'
      })
    }
  }
})