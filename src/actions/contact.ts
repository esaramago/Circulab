import { defineAction, ActionError } from 'astro:actions'
import { z } from 'astro/zod'
import { createClient } from '@/utils/supabase'
import { sendContactEmail } from '@/utils/brevo'
import { m } from '@/paraglide/messages.js'

export const submitContact = defineAction({
  accept: 'form',
  input: z.object({
    name: z.string().min(2, m['contacts.name_min']()),
    email: z.email(m['contacts.email_invalid']()),
    subject: z.string().min(3, m['contacts.subject_min']()),
    message: z.string().min(10, m['contacts.message_min']()),
  }),
  handler: async ({ name, email, subject, message }, { request, cookies, locals }) => {
    try {
      const supabase = createClient({ request, cookies })

      // 1. Store message in Supabase
      const { error: dbError } = await supabase
        .from('contact_messages')
        .insert({
          name,
          email,
          subject,
          message,
          status: 'unread',
        })

      if (dbError) {
        console.error('[Contact Action] Supabase insert error:', dbError)
      } else {
        console.log('[Contact Action] Supabase insert success')
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
        console.error('[Contact Action] Failure details:', {
          dbError: dbError ? `${dbError.code}: ${dbError.message}` : null,
          brevoError: emailResult.error || null,
        })

        throw new ActionError({
          message: m['contacts.error']({}, { locale: locals.locale }),
          code: 'INTERNAL_SERVER_ERROR',
        })
      }

      return {
        success: true,
        message: m['contacts.success']({}, { locale: locals.locale }),
      }
    } catch (error: any) {
      if (error instanceof ActionError) {
        throw error
      }
      console.error('[Contact Action] Error:', error)
      throw new ActionError({
        message: error.message || m['contacts.process_error']({}, { locale: locals.locale }),
        code: 'INTERNAL_SERVER_ERROR',
      })
    }
  },
})
