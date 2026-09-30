import type { EmailLocale, RenderedEmail } from '../../types'
import { renderBaseLayout, renderButton, escapeHtml } from '../../layouts/baseLayout'
import { m } from '@/paraglide/messages.js'

const CONTACT_EMAIL = import.meta.env.CONTACT_FROM_EMAIL || 'info@circulab.pt'

interface EmailChangeEmailOptions {
  confirmationUrl: string
  locale: EmailLocale
  email?: string
  newEmail?: string
}

export function renderEmailChangeEmail({
  confirmationUrl,
  locale,
  email,
  newEmail,
}: EmailChangeEmailOptions): RenderedEmail {
  const subject = m['email.auth_email_change_subject']({}, { locale })
  const title = m['email.auth_email_change_title']({}, { locale })
  const intro = m['email.auth_email_change_intro']({}, { locale })
  const cta = email && newEmail && email !== newEmail
    ? m['email.auth_email_change_cta_with_emails']({ email, newEmail }, { locale })
    : m['email.auth_email_change_cta']({}, { locale })
  const buttonLabel = m['email.auth_email_change_button']({}, { locale })
  const fallbackLabel = m['email.auth_email_change_fallback']({}, { locale })
  const ignoreText = m['email.auth_email_change_ignore']({ contactEmail: CONTACT_EMAIL }, { locale })
  const closing = m['email.auth_email_change_closing']({}, { locale })

  const ignoreHtml = escapeHtml(ignoreText).replace(
    CONTACT_EMAIL,
    `<a href="mailto:${CONTACT_EMAIL}" style="color: #549C89; text-decoration: underline;">${CONTACT_EMAIL}</a>`
  )

  const content = `
    <h1 style="font-size: 20px; font-weight: 700; color: #18181b; margin: 0 0 16px 0; letter-spacing: -0.3px;">
      ${escapeHtml(title)}
    </h1>
    <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #3f3f46;">
      ${escapeHtml(intro)}
    </p>
    <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #3f3f46;">
      ${escapeHtml(cta)}
    </p>

    ${renderButton(confirmationUrl, buttonLabel)}

    <div style="margin-top: 24px; padding: 14px; background-color: #f4f4f5; border-radius: 6px; font-size: 12px; color: #52525b; line-height: 1.5;">
      <p style="margin: 0 0 6px 0; font-weight: 600;">${escapeHtml(fallbackLabel)}</p>
      <p style="margin: 0; word-break: break-all;">
        <a href="${escapeHtml(confirmationUrl)}" target="_blank" style="color: #549C89; text-decoration: underline;">
          ${escapeHtml(confirmationUrl)}
        </a>
      </p>
    </div>

    <p style="margin: 24px 0 16px 0; font-size: 14px; line-height: 1.6; color: #71717a;">
      ${ignoreHtml}
    </p>

    <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #3f3f46;">
      ${escapeHtml(closing)}
    </p>
  `

  const html = renderBaseLayout({
    title: subject,
    content,
    locale,
    previewText: title,
  })

  const plainText = `${title}\n\n${intro}\n\n${cta}\n\n${confirmationUrl}\n\n${ignoreText}\n\n${closing}\n\nhttps://circulab.pt`

  return { subject, html, text: plainText }
}
