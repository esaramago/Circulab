import { defineAction, ActionError, type ActionErrorCode } from 'astro:actions'
import { createClient } from '@/utils/supabase'
import { updateTypologySchema } from '@/schemas/typology.server'
import { z } from 'astro/zod'

export const updateTypology = defineAction({
  input: z.any(),
  handler: async (rawInput, { request, cookies }) => {
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
          name: input.name,
          description: input.description || null,
          color: input.color || null
        })
        .eq('id', input.id)
        .select('*')
        .single()

      if (error) {
        throw new ActionError({
          message: error.message || 'Failed to update typology',
          code: error.code as ActionErrorCode
        })
      }

      return { success: true, typology: data }

    } catch (error: any) {
      if (error instanceof ActionError) throw error
      throw new ActionError({
        message: error.message || 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR'
      })
    }
  }
})
