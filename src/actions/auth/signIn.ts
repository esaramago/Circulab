import { defineAction, ActionError, type ActionErrorCode } from 'astro:actions'
import { z } from 'astro/zod'
import { createClient } from '@/utils/supabase'

export const signIn = defineAction({
  accept: 'form',
  input: z.object({
    email: z.email(),
    password: z.string(),
  }),
  handler: async ({email, password}, context) => {

    try {
      const supabase = createClient({
        request: context.request,
        cookies: context.cookies,
      })
      const { data: signInData, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })

      if (error) {
        throw new ActionError({
          message: error.message || 'Failed to sign in',
          code: error.code as ActionErrorCode
        })
      }

      const userId = signInData.user?.id
      if (!userId) {
        throw new ActionError({
          message: 'Signed in but no user id returned',
          code: 'INTERNAL_SERVER_ERROR'
        })
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (userError || !userData) {
        throw new ActionError({
          message:
            userError?.message ||
            `No users row found for authenticated id ${userId}`,
          code: 'NOT_FOUND'
        })
      }

      // Set the user in the locals
      context.locals.user = userData

      return {
        success: true,
        message: 'Sign in successful',
      }
    } catch (error: any) {
      throw new ActionError({
        message: error.message || 'Failed to sign in',
        code: error.code as ActionErrorCode
      })
    }
  },
})