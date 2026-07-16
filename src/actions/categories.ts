import { defineAction, ActionError, type ActionErrorCode } from 'astro:actions'
import { createClient } from '@/utils/supabase'
import { categorySchema } from '@/schemas/category.server'
import { z } from 'astro/zod'

export const addCategory = defineAction({
  input: z.any(),
  handler: async (rawInput, { request, cookies }) => {
    console.log('[Actions] addCategory rawInput:', rawInput)
    const result = categorySchema.safeParse(rawInput)
    if (!result.success) {
      console.error('[Actions] addCategory validation failed:', result.error.format())
      throw new ActionError({
        message: 'Invalid input: ' + JSON.stringify(result.error.format()),
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
        .from('categories')
        .insert({
          name: input.name,
          description: input.description || null,
          typology_id: input.typology_id
        })
        .select('*')
        .single()

      if (error) {
        console.log('[Actions] addCategory error:', error)
        throw new ActionError({
          message: error.message || 'Failed to add category',
          code: error.code as ActionErrorCode
        })
      }

      return { success: true, category: data }

    } catch (error: any) {
      console.log('[Actions] addCategory error:', error)
      if (error instanceof ActionError) throw error
      throw new ActionError({
        message: error.message || 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR'
      })
    }
  }
})

export const updateCategory = defineAction({
  input: z.any(),
  handler: async (rawInput, { request, cookies }) => {
    console.log('[Actions] updateCategory rawInput:', rawInput)
    const result = categorySchema.extend({ id: z.string().min(1) }).safeParse(rawInput)
    if (!result.success) {
      console.error('[Actions] updateCategory validation failed:', result.error.format())
      throw new ActionError({
        message: 'Invalid input: ' + JSON.stringify(result.error.format()),
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
        .from('categories')
        .update({
          name: input.name,
          description: input.description || null,
          typology_id: input.typology_id
        })
        .eq('id', input.id)
        .select('*')
        .single()

      if (error) {
        throw new ActionError({
          message: error.message || 'Failed to update category',
          code: error.code as ActionErrorCode
        })
      }

      return { success: true, category: data }

    } catch (error: any) {
      if (error instanceof ActionError) throw error
      throw new ActionError({
        message: error.message || 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR'
      })
    }
  }
})

export const deleteCategory = defineAction({
  input: z.object({
    id: z.string().min(1)
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

      if (profileError || userProfile?.roles?.code !== 'admin') {
        throw new ActionError({
          message: 'Not authorized as admin',
          code: 'UNAUTHORIZED',
        })
      }

      // Check for associated pins to prevent foreign key issues
      const { count, error: countError } = await supabase
        .from('pins')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', input.id)

      if (countError) {
        throw new ActionError({
          message: countError.message || 'Failed to check referencing pins',
          code: countError.code as ActionErrorCode
        })
      }

      if (count && count > 0) {
        throw new ActionError({
          message: 'Não é possível eliminar a categoria porque existem recursos associados a ela.',
          code: 'CONFLICT'
        })
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', input.id)

      if (error) {
        throw new ActionError({
          message: error.message || 'Failed to delete category',
          code: error.code as ActionErrorCode
        })
      }

      return { success: true }

    } catch (error: any) {
      if (error instanceof ActionError) throw error
      throw new ActionError({
        message: error.message || 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR'
      })
    }
  }
})
