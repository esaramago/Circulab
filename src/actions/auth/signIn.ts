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
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })

      if (error) {
        throw new ActionError({
          message: error.message || 'Failed to sign in',
          code: error.code as ActionErrorCode
        })
      }

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