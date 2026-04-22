import { defineAction, ActionError, type ActionErrorCode } from 'astro:actions'
import { bindFetchDB } from '@/utils/fetchDB'
import { z } from 'astro/zod'

export const getUser = defineAction({
  input: z.object({
    id: z.string(),
  }),
  handler: async ({ id }, { request, cookies }) => {
    try {
      const db = bindFetchDB({ request, cookies })
      const { data } = await db('users').select('*').eq('id', id).single()
      return data
    } catch (error: any) {
      throw new ActionError({
        message: error.message || 'Failed to get public user',
        code: error.code as ActionErrorCode
      })
    }
  },
})