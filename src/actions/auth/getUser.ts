import { defineAction, ActionError, type ActionErrorCode } from 'astro:actions'
import { createClient } from '@/utils/supabase'

export const getUser = defineAction({
  handler: async (_input, { request, cookies }) => {

    try {
      const supabase = createClient({
        request,
        cookies,
      })
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        return null
      }
      const appMeta = data.user.app_metadata as { role?: string } | null | undefined
      return {
        id: data.user.id,
        email: data.user.email,
        role: appMeta?.role,
      }

    } catch (error: any) {
      throw new ActionError({
        message: error.message || 'Failed to get user',
        code: error.code as ActionErrorCode
      })
    }
  },
})