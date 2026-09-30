import { defineAction, ActionError } from 'astro:actions'
import { z } from 'astro/zod'
import { createClient } from '@/utils/supabase'
import { m } from '@/paraglide/messages.js'

export const verifyOtp = defineAction({
  input: z.object({
    email: z.string().email(),
    token: z.string().min(6),
  }),
  handler: async ({ email, token }, context) => {
    try {
      const supabase = createClient({
        request: context.request,
        cookies: context.cookies,
      })

      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      })

      if (error) {
        throw new ActionError({
          message: m['auth.otp_invalid_code']({}, { locale: context.locals.locale }) || error.message,
          code: 'BAD_REQUEST',
        })
      }

      const userId = data.user?.id
      if (!userId) {
        throw new ActionError({
          message: 'Verified but no user returned',
          code: 'INTERNAL_SERVER_ERROR',
        })
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          role:roles(*)
        `)
        .eq('id', userId)
        .maybeSingle()

      if (userError || !userData) {
        throw new ActionError({
          message: userError?.message || 'User profile not found',
          code: 'NOT_FOUND',
        })
      }

      context.locals.user = userData as any

      return {
        success: true,
        user: userData as any,
        session: data.session
          ? {
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
            }
          : null,
      }
    } catch (error: unknown) {
      if (error instanceof ActionError) {
        throw error
      }
      const message = error instanceof Error ? error.message : 'Failed to verify code'
      throw new ActionError({
        message,
        code: 'INTERNAL_SERVER_ERROR',
      })
    }
  },
})
