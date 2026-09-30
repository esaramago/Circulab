import type { APIRoute } from 'astro'
import { Webhook } from 'standardwebhooks'
import type { EmailLocale, SupabaseAuthHookEvent } from '@/emails/types'
import { sendEmail } from '@/emails/client'
import { renderOtpEmail } from '@/emails/templates/auth/otp'
import { renderResetPasswordEmail } from '@/emails/templates/auth/resetPassword'
import { renderSignupEmail } from '@/emails/templates/auth/signup'
import { renderInviteEmail } from '@/emails/templates/auth/invite'
import { renderEmailChangeEmail } from '@/emails/templates/auth/emailChange'

export const POST: APIRoute = async ({ request }) => {
  const rawBody = await request.text()
  const rawSecret =
    import.meta.env.SEND_EMAIL_HOOK_SECRET ||
    process.env.SEND_EMAIL_HOOK_SECRET ||
    ''

  // Clean secret prefix if provided as 'v1,whsec_...' or 'whsec_...'
  const hookSecret = rawSecret.replace(/^v1,/, '')

  // 1. Verify standard webhook signature if secret is configured
  if (hookSecret) {
    const headersObject = Object.fromEntries(request.headers.entries())
    const hasSignatureHeaders =
      headersObject['webhook-id'] ||
      headersObject['webhook-signature'] ||
      headersObject['svix-id'] ||
      headersObject['svix-signature']

    if (import.meta.env.DEV && !hasSignatureHeaders) {
      console.warn('[Auth Hook] Dev mode: Skipping webhook signature verification because signature headers are absent.')
    } else {
      const wh = new Webhook(hookSecret)
      try {
        wh.verify(rawBody, headersObject)
      } catch (err) {
        console.error('[Auth Hook] Invalid webhook signature:', err)
        return new Response(JSON.stringify({ error: 'Invalid webhook signature' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }
  } else {
    console.warn('[Auth Hook] SEND_EMAIL_HOOK_SECRET not configured. Skipping signature verification.')
  }

  // 2. Parse payload
  let payload: SupabaseAuthHookEvent
  try {
    payload = JSON.parse(rawBody)
  } catch (err) {
    console.error('[Auth Hook] Failed to parse JSON payload:', err)
    return new Response(JSON.stringify({ error: 'Malformed JSON payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { user, email_data } = payload
  if (!user || !email_data) {
    return new Response(JSON.stringify({ error: 'Missing user or email_data' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const {
    token,
    token_hash,
    token_new,
    token_hash_new,
    redirect_to,
    email_action_type,
    site_url,
  } = email_data

  // 3. Resolve recipient locale
  const rawLocale =
    (user.user_metadata?.language as string) ||
    (user.user_metadata?.locale as string) ||
    'pt'
  const locale: EmailLocale = rawLocale === 'en' ? 'en' : 'pt'

  // 4. Build standard verification URL
  const baseUrl = (site_url || import.meta.env.SITE || 'https://circulab.pt').replace(/\/+$/, '')
  function buildVerifyUrl(hash: string, actionType: string): string {
    const url = new URL(`${baseUrl}/auth/v1/verify`)
    url.searchParams.set('token', hash)
    url.searchParams.set('type', actionType)
    if (redirect_to) {
      url.searchParams.set('redirect_to', redirect_to)
    }
    return url.toString()
  }

  const confirmationUrl = token_hash
    ? buildVerifyUrl(token_hash, email_action_type)
    : ''

  console.log(`[Auth Hook] Processing action '${email_action_type}' for user ${user.email} (locale: ${locale})`)

  try {
    let sendResult
    switch (email_action_type) {
      case 'signup': {
        const rendered = renderSignupEmail({ confirmationUrl, locale })
        sendResult = await sendEmail({
          to: user.email!,
          subject: rendered.subject,
          html: rendered.html,
          text: rendered.text,
        })
        break
      }

      case 'recovery': {
        const rendered = renderResetPasswordEmail({ confirmationUrl, locale })
        sendResult = await sendEmail({
          to: user.email!,
          subject: rendered.subject,
          html: rendered.html,
          text: rendered.text,
        })
        break
      }

      case 'magiclink':
      case 'reauthentication': {
        const rendered = renderOtpEmail({ token, confirmationUrl, locale })
        sendResult = await sendEmail({
          to: user.email!,
          subject: rendered.subject,
          html: rendered.html,
          text: rendered.text,
        })
        break
      }

      case 'email_change': {
        // When Secure Email Change is enabled:
        // token_hash_new -> current email (user.email)
        // token_hash -> new email (email_data.new_email or user.email if single)
        const currentEmail = user.email || email_data.old_email || ''
        const targetNewEmail = email_data.new_email || user.email!
        const newEmailUrl = buildVerifyUrl(token_hash, 'email_change')
        const renderedNew = renderEmailChangeEmail({
          confirmationUrl: newEmailUrl,
          locale,
          email: currentEmail,
          newEmail: targetNewEmail,
        })

        sendResult = await sendEmail({
          to: targetNewEmail,
          subject: renderedNew.subject,
          html: renderedNew.html,
          text: renderedNew.text,
        })

        // If a hash for the old email is present, notify the current email
        if (token_hash_new && user.email && targetNewEmail !== user.email) {
          const oldEmailUrl = buildVerifyUrl(token_hash_new, 'email_change')
          const renderedOld = renderEmailChangeEmail({
            confirmationUrl: oldEmailUrl,
            locale,
            email: currentEmail,
            newEmail: targetNewEmail,
          })
          await sendEmail({
            to: user.email,
            subject: renderedOld.subject,
            html: renderedOld.html,
            text: renderedOld.text,
          })
        }
        break
      }

      case 'invite': {
        const rendered = renderInviteEmail({ confirmationUrl, locale })
        sendResult = await sendEmail({
          to: user.email!,
          subject: rendered.subject,
          html: rendered.html,
          text: rendered.text,
        })
        break
      }

      default: {
        console.warn(`[Auth Hook] Unhandled email action type: ${email_action_type}`)
        if (confirmationUrl && user.email) {
          const rendered = renderSignupEmail({ confirmationUrl, locale })
          sendResult = await sendEmail({
            to: user.email,
            subject: rendered.subject,
            html: rendered.html,
            text: rendered.text,
          })
        }
        break
      }
    }

    if (sendResult && !sendResult.success) {
      throw new Error(sendResult.error || 'Failed to dispatch email via Brevo')
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('[Auth Hook] Error dispatching email:', error)
    return new Response(
      JSON.stringify({ error: error?.message || 'Failed to dispatch email' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
}
