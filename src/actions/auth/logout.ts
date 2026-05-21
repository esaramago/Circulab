import { defineAction, ActionError, type ActionErrorCode } from 'astro:actions'
import { createClient } from '@/utils/supabase'

export const logout = defineAction({
  handler: async (_input, { request, cookies }) => {

    try {
      const supabase = createClient({
        request,
        cookies,
      })
      await supabase.auth.signOut()
      return {
        success: true,
        message: 'Logout successful',
      }
    } catch (error: any) {
      throw new ActionError({
        message: error.message || 'Failed to logout',
        code: error.code as ActionErrorCode
      })
    }
  },
})