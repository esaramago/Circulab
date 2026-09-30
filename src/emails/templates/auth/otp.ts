import type { EmailLocale, RenderedEmail } from '../../types'
import { renderBaseLayout, renderButton, escapeHtml } from '../../layouts/baseLayout'
import { m } from '@/paraglide/messages.js'

interface OtpEmailOptions {
  token: string
  confirmationUrl?: string
  locale: EmailLocale
}

export function renderOtpEmail({
  token,
  confirmationUrl,
  locale,
}: OtpEmailOptions): RenderedEmail {
  const subject = m['email.auth_otp_subject']({}, { locale })
  const title = m['email.auth_otp_title']({}, { locale })
  const text = m['email.auth_otp_text']({}, { locale })
  const expiry = m['email.auth_otp_expiry']({}, { locale })

  const ctaButton = confirmationUrl
    ? renderButton(confirmationUrl, title)
    : ''

  const content = `
    <h1 style="font-size: 20px; font-weight: 700; color: #18181b; margin: 0 0 16px 0; letter-spacing: -0.3px;">
      ${escapeHtml(title)}
    </h1>
    <p style="margin: 0 0 20px 0; font-size: 15px; color: #3f3f46;">
      ${escapeHtml(text)}
    </p>

    <!-- Code Display Box -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
      <tr>
        <td align="center" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px 28px;">
          <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #15803d;">
            ${escapeHtml(token)}
          </span>
        </td>
      </tr>
    </table>

    ${ctaButton}

    <p style="margin: 20px 0 0 0; font-size: 13px; color: #71717a; line-height: 1.5;">
      ${escapeHtml(expiry)}
    </p>
  `

  const html = renderBaseLayout({
    title: subject,
    content,
    locale,
    previewText: `${title}: ${token}`,
  })

  const plainText = `${title}\n\n${text}\n\n${token}\n\n${expiry}\n\nhttps://circulab.pt`

  return { subject, html, text: plainText }
}
