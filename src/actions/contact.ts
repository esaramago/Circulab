import { defineAction, ActionError } from 'astro:actions'
import { z } from 'astro/zod'

export const submitContact = defineAction({
  accept: 'form',
  input: z.object({
    name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
    email: z.email('Endereço de email inválido'),
    subject: z.string().min(3, 'O assunto deve ter pelo menos 3 caracteres'),
    message: z.string().min(10, 'A mensagem deve ter pelo menos 10 caracteres'),
  }),
  handler: async ({ name, email, subject, message }) => {
    try {
      // Log submission details for processing
      console.log('[Contact Action] Form submission:', { name, email, subject, message, date: new Date().toISOString() })

      return {
        success: true,
        message: 'Mensagem enviada com sucesso!',
      }
    } catch (error: any) {
      console.error('[Contact Action] Error:', error)
      throw new ActionError({
        message: error.message || 'Ocorreu um erro ao processar a mensagem',
        code: 'INTERNAL_SERVER_ERROR',
      })
    }
  },
})
