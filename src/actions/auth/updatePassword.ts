import { defineAction, ActionError, type ActionErrorCode } from 'astro:actions'
import { z } from 'astro/zod'
import { createClient } from '@/utils/supabase'

export const updatePassword = defineAction({
  accept: 'form',
  input: z.object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    passwordConfirm: z.string(),
  }),
  handler: async ({ password, passwordConfirm }, { request, cookies }) => {
    if (password !== passwordConfirm) {
      throw new ActionError({
        message: 'Passwords do not match',
        code: 'BAD_REQUEST',
      })
    }

    try {
      const supabase = createClient({ request, cookies })

      const { data: auth, error: authError } = await supabase.auth.getUser()
      if (authError || !auth.user) {
        throw new ActionError({
          message: 'Your reset link has expired. Please request a new one.',
          code: 'UNAUTHORIZED',
        })
      }

      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        throw new ActionError({
          message: error.message || 'Failed to update password',
          code: error.code as ActionErrorCode,
        })
      }

      return {
        success: true,
        message: 'Your password has been updated.',
      }
    } catch (error: unknown) {
      if (error instanceof ActionError) {
        throw error
      }
      const message = error instanceof Error ? error.message : 'Failed to update password'
      throw new ActionError({
        message,
        code: 'INTERNAL_SERVER_ERROR',
      })
    }
  },
})
