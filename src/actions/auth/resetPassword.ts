import { defineAction, ActionError } from 'astro:actions'
import { z } from 'astro/zod'
import { createClient } from '@/utils/supabase'
import { m } from '@/paraglide/messages.js'

const siteUrl = import.meta.env.SITE

export const resetPassword = defineAction({
  accept: 'form',
  input: z.object({
    email: z.email(),
  }),
  handler: async ({ email }, { request, cookies, locals }) => {
    try {
      const supabase = createClient({ request, cookies })
      const redirectTo = `${siteUrl}/auth/confirm`

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      })

      if (error) {
        const isRateLimit = error.code === 'over_email_send_rate_limit' || error.status === 429
        throw new ActionError({
          message: isRateLimit
            ? m['auth.reset_rate_limit']({}, { locale: locals.locale })
            : m['auth.failed_send_reset']({}, { locale: locals.locale }),
          code: isRateLimit ? 'TOO_MANY_REQUESTS' : 'BAD_REQUEST',
        })
      }

      return {
        success: true,
        message: m['auth.reset_password_success']({}, { locale: locals.locale }),
      }
    } catch (error: unknown) {
      if (error instanceof ActionError) {
        throw error
      }
      throw new ActionError({
        message: m['auth.failed_send_reset']({}, { locale: locals.locale }),
        code: 'INTERNAL_SERVER_ERROR',
      })
    }
  },
})
