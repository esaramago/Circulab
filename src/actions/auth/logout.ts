import { defineAction, ActionError, type ActionErrorCode } from 'astro:actions'
import { createClient } from '@/utils/supabase'
import { m } from '@/paraglide/messages.js'

export const logout = defineAction({
  handler: async (_input, { request, cookies, locals }) => {

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
        message: error.message || m['auth.failed_logout']({}, { locale: locals?.locale }),
        code: error.code as ActionErrorCode
      })
    }
  },
})