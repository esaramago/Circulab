import type { SendEmailPayload, BrevoEmailResult } from './types'
import { m } from '@/paraglide/messages.js'

export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
}: SendEmailPayload): Promise<BrevoEmailResult> {
  const apiKey =
    import.meta.env.BREVO_API_KEY ||
    process.env.BREVO_API_KEY

  const fromEmail =
    import.meta.env.CONTACT_FROM_EMAIL ||
    process.env.CONTACT_FROM_EMAIL ||
    'info@circulab.pt'

  const fromName =
    import.meta.env.CONTACT_FROM_NAME ||
    process.env.CONTACT_FROM_NAME ||
    'Circulab'

  if (!apiKey) {
    const msg = 'BREVO_API_KEY is not configured in environment variables'
    console.warn(`[Email] ${msg}`)
    return {
      success: false,
      skipped: true,
      error: msg,
    }
  }

  const recipients = typeof to === 'string' ? [{ email: to }] : to

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: fromName,
          email: fromEmail,
        },
        to: recipients,
        replyTo: replyTo || {
          name: fromName,
          email: fromEmail,
        },
        subject,
        textContent: text || '',
        htmlContent: html,
      }),
    })

    const responseBody = await response.json().catch(() => ({}))

    if (!response.ok) {
      console.error('[Email] Failed to send email via Brevo:', response.status, responseBody)
      return {
        success: false,
        error: responseBody?.message || JSON.stringify(responseBody) || `HTTP ${response.status}`,
      }
    }

    console.log('[Email] Email sent successfully! MessageId:', responseBody?.messageId)
    return {
      success: true,
      messageId: responseBody?.messageId,
    }
  } catch (error: any) {
    console.error('[Email] Network or dispatch error:', error)
    return {
      success: false,
      error: error?.message || m['common.failed_brevo_api'](),
    }
  }
}
