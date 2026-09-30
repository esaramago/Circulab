import type { EmailLocale, RenderedEmail } from '../../types'
import { renderBaseLayout, renderButton, escapeHtml } from '../../layouts/baseLayout'
import { m } from '@/paraglide/messages.js'

const CONTACT_EMAIL = 'info@circulab.pt'

interface ResetPasswordEmailOptions {
  confirmationUrl: string
  locale: EmailLocale
}

export function renderResetPasswordEmail({
  confirmationUrl,
  locale,
}: ResetPasswordEmailOptions): RenderedEmail {
  const subject = m['email.auth_reset_subject']({}, { locale })
  const title = m['email.auth_reset_title']({}, { locale })
  const intro = m['email.auth_reset_intro']({}, { locale })
  const cta = m['email.auth_reset_cta']({}, { locale })
  const buttonLabel = m['email.auth_reset_button']({}, { locale })
  const fallbackLabel = m['email.auth_reset_fallback']({}, { locale })
  const ignoreNotice = m['email.auth_reset_ignore']({}, { locale })
  const helpNotice = m['email.auth_reset_help']({ contactEmail: CONTACT_EMAIL }, { locale })

  const helpHtml = escapeHtml(helpNotice).replace(
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

    <p style="margin: 24px 0 8px 0; font-size: 14px; line-height: 1.6; color: #71717a;">
      ${escapeHtml(ignoreNotice)}
    </p>
    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #71717a;">
      ${helpHtml}
    </p>
  `

  const html = renderBaseLayout({
    title: subject,
    content,
    locale,
    previewText: title,
  })

  const plainText = `${title}\n\n${intro}\n\n${cta}\n\n${confirmationUrl}\n\n${ignoreNotice}\n\n${helpNotice}\n\nhttps://circulab.pt`

  return { subject, html, text: plainText }
}
