import { defineAction, ActionError } from 'astro:actions'
import { z } from 'astro/zod'
import { createClient } from '@/utils/supabase'
import { sendContactEmail } from '@/utils/brevo'

export const submitContact = defineAction({
  accept: 'form',
  input: z.object({
    name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
    email: z.email('Endereço de email inválido'),
    subject: z.string().min(3, 'O assunto deve ter pelo menos 3 caracteres'),
    message: z.string().min(10, 'A mensagem deve ter pelo menos 10 caracteres'),
  }),
  handler: async ({ name, email, subject, message }, { request, cookies }) => {
    try {
      const supabase = createClient({ request, cookies })

      // 1. Store message in Supabase
      const { data: dbData, error: dbError } = await supabase
        .from('contact_messages')
        .insert({
          name,
          email,
          subject,
          message,
          status: 'unread',
        })
        .select()

      if (dbError) {
        console.error('[Contact Action] Supabase insert error:', dbError)
      } else {
        console.log('[Contact Action] Supabase insert success:', dbData)
      }

      // 2. Dispatch email notification via Brevo
      const emailResult = await sendContactEmail({
        name,
        email,
        subject,
        message,
      })

      if (!emailResult.success) {
        console.warn('[Contact Action] Brevo dispatch warning:', emailResult.error)
      }

      if (dbError || !emailResult.success) {
        const errors: string[] = []
        if (dbError) errors.push(`Base de dados: ${dbError.message}`)
        if (!emailResult.success) errors.push(`Email: ${emailResult.error}`)

        throw new ActionError({
          message: `Falha no envio: ${errors.join(' — ')}`,
          code: 'INTERNAL_SERVER_ERROR',
        })
      }

      return {
        success: true,
        message: 'Mensagem enviada com sucesso!',
      }
    } catch (error: any) {
      if (error instanceof ActionError) {
        throw error
      }
      console.error('[Contact Action] Error:', error)
      throw new ActionError({
        message: error.message || 'Ocorreu um erro ao processar a mensagem',
        code: 'INTERNAL_SERVER_ERROR',
      })
    }
  },
})
