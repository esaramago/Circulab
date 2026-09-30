import type { EmailLocale, RenderedEmail } from '../types'
import { renderBaseLayout, escapeHtml } from '../layouts/baseLayout'
import { m } from '@/paraglide/messages.js'

interface ContactEmailOptions {
  name: string
  email: string
  subject: string
  message: string
  locale?: EmailLocale
}

export function renderContactEmail({
  name,
  email,
  subject,
  message,
  locale = 'pt',
}: ContactEmailOptions): RenderedEmail {
  const prefix = m['email.contact_subject_prefix']({}, { locale })
  const fullSubject = `${prefix} ${subject}`
  const title = m['email.contact_received_title']({}, { locale })
  const labelName = m['email.contact_label_name']({}, { locale })
  const labelEmail = m['email.contact_label_email']({}, { locale })
  const labelSubject = m['email.contact_label_subject']({}, { locale })
  const labelMessage = m['email.contact_label_message']({}, { locale })
  const footerNote = m['email.contact_footer_note']({}, { locale })

  const content = `
    <h1 style="font-size: 20px; font-weight: 700; color: #549C89; margin: 0 0 20px 0; letter-spacing: -0.3px;">
      ${escapeHtml(title)}
    </h1>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
      <tr>
        <td style="padding: 6px 0; font-size: 14px; color: #52525b; width: 90px; vertical-align: top;">
          <strong>${escapeHtml(labelName)}:</strong>
        </td>
        <td style="padding: 6px 0; font-size: 14px; color: #18181b;">
          ${escapeHtml(name)}
        </td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-size: 14px; color: #52525b; vertical-align: top;">
          <strong>${escapeHtml(labelEmail)}:</strong>
        </td>
        <td style="padding: 6px 0; font-size: 14px; color: #18181b;">
          <a href="mailto:${escapeHtml(email)}" style="color: #549C89; text-decoration: underline;">${escapeHtml(email)}</a>
        </td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-size: 14px; color: #52525b; vertical-align: top;">
          <strong>${escapeHtml(labelSubject)}:</strong>
        </td>
        <td style="padding: 6px 0; font-size: 14px; color: #18181b;">
          ${escapeHtml(subject)}
        </td>
      </tr>
    </table>

    <div style="margin-top: 16px; padding: 18px; background-color: #f9fbf9; border-left: 4px solid #549C89; border-radius: 4px;">
      <h3 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #15803d;">
        ${escapeHtml(labelMessage)}
      </h3>
      <div style="font-size: 15px; color: #27272a; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(message)}</div>
    </div>

    <p style="margin: 24px 0 0 0; font-size: 12px; color: #71717a;">
      ${escapeHtml(footerNote)}
    </p>
  `

  const html = renderBaseLayout({
    title: fullSubject,
    content,
    locale,
    previewText: `${name}: ${subject}`,
  })

  const plainText = `${title}\n\n${labelName}: ${name}\n${labelEmail}: ${email}\n${labelSubject}: ${subject}\n\n${labelMessage}:\n${message}\n\n${footerNote}`

  return { subject: fullSubject, html, text: plainText }
}
