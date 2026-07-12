import { defineAction, ActionError, type ActionErrorCode } from 'astro:actions'
import { createClient } from '@/utils/supabase'

export const getSession = defineAction({
  handler: async (_input, { request, cookies }) => {
    try {
      const supabase = createClient({ request, cookies })
      const { data, error } = await supabase.auth.getSession()
      if (error || !data.session) {
        return null
      }
      return {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      }
    } catch (error: any) {
      throw new ActionError({
        message: error.message || 'Failed to get session',
        code: error.code as ActionErrorCode,
      })
    }
  },
})
