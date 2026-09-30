import type { ContactFormInput } from '@/types/domain/contact'
import type { BrevoEmailResult } from '@/emails/types'
import { sendEmail } from '@/emails/client'
import { renderContactEmail } from '@/emails/templates/contact'
import { renderModerationEmail } from '@/emails/templates/moderation'

export type { BrevoEmailResult }

export interface ModerationEmailInput {
  toEmail: string
  resourceTitle: string
  status: 'accepted' | 'rejected'
  locale?: 'pt' | 'en'
}

export async function sendContactEmail({
  name,
  email,
  subject,
  message,
}: ContactFormInput): Promise<BrevoEmailResult> {
  const toEmail =
    import.meta.env.CONTACT_TO_EMAIL ||
    process.env.CONTACT_TO_EMAIL ||
    'info@circulab.pt'

  const rendered = renderContactEmail({
    name,
    email,
    subject,
    message,
    locale: 'pt',
  })

  return sendEmail({
    to: toEmail,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    replyTo: {
      name,
      email,
    },
  })
}

export async function sendModerationEmail({
  toEmail,
  resourceTitle,
  status,
  locale = 'pt',
}: ModerationEmailInput): Promise<BrevoEmailResult> {
  const rendered = renderModerationEmail({
    resourceTitle,
    status,
    locale,
  })

  return sendEmail({
    to: toEmail,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
  })
}
