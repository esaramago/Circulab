import { defineAction, ActionError } from 'astro:actions'
import { z } from 'astro/zod'
import { createClient } from '@/utils/supabase'
import { m } from '@/paraglide/messages.js'

export const sendOtp = defineAction({
  input: z.object({
    email: z.string().email(),
  }),
  handler: async ({ email }, { request, cookies, locals }) => {
    try {
      const supabase = createClient({ request, cookies })
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      })

      if (error) {
        const isRateLimit = error.code === 'over_email_send_rate_limit' || error.status === 429
        throw new ActionError({
          message: isRateLimit
            ? m['auth.reset_rate_limit']({}, { locale: locals.locale })
            : error.message || 'Failed to send confirmation code',
          code: isRateLimit ? 'TOO_MANY_REQUESTS' : 'BAD_REQUEST',
        })
      }

      return {
        success: true,
        message: m['auth.otp_code_sent']({ email }, { locale: locals.locale }),
      }
    } catch (error: unknown) {
      if (error instanceof ActionError) {
        throw error
      }
      throw new ActionError({
        message: error instanceof Error ? error.message : 'Failed to send confirmation code',
        code: 'INTERNAL_SERVER_ERROR',
      })
    }
  },
})
