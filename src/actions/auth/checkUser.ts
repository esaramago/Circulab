import { defineAction, ActionError, type ActionErrorCode } from 'astro:actions'
import { createClient } from '@/utils/supabase'

export const checkUser = defineAction({
  handler: async (_input, { request, cookies }) => {

    try {
      const supabase = createClient({
        request,
        cookies,
      })
      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) {
        return null
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', auth.user.id)
        .single()

      if (userError || !userData) {
        return null
      }
      return userData

    } catch (error: any) {
      throw new ActionError({
        message: error.message || 'Failed to get user',
        code: error.code as ActionErrorCode
      })
    }
  },
})