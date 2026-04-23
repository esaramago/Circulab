import { defineAction, ActionError, type ActionErrorCode } from 'astro:actions'
import { fetchDB } from '@/utils/fetchDB'
import { z } from 'astro/zod'

export const getUser = defineAction({
  input: z.object({
    id: z.string(),
  }),
  handler: async ({ id }) => {
    try {
      const { data } = await fetchDB('users').select('*').eq('id', id).single()
      return data
    } catch (error: any) {
      throw new ActionError({
        message: error.message || 'Failed to get public user',
        code: error.code as ActionErrorCode
      })
    }
  },
})