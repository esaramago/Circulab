import { defineAction, ActionError, type ActionErrorCode } from 'astro:actions'
import { z } from 'astro/zod'
import { createClient } from '@/utils/supabase'

const siteUrl = import.meta.env.SITE

export const resetPassword = defineAction({
  accept: 'form',
  input: z.object({
    email: z.email(),
  }),
  handler: async ({ email }, { request, cookies }) => {
    try {
      const supabase = createClient({ request, cookies })
      const redirectTo = `${siteUrl}/auth/confirm`

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      })

      if (error) {
        throw new ActionError({
          message: error.message || 'Failed to send reset email',
          code: error.code as ActionErrorCode,
        })
      }

      return {
        success: true,
        message: 'If an account exists for this email, you will receive a password reset link shortly.',
      }
    } catch (error: unknown) {
      if (error instanceof ActionError) {
        throw error
      }
      const message = error instanceof Error ? error.message : 'Failed to send reset email'
      throw new ActionError({
        message,
        code: 'INTERNAL_SERVER_ERROR',
      })
    }
  },
})
