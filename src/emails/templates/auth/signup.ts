import type { EmailLocale, RenderedEmail } from '../../types'
import { renderBaseLayout, renderButton, escapeHtml } from '../../layouts/baseLayout'
import { m } from '@/paraglide/messages.js'

interface SignupEmailOptions {
  token?: string
  confirmationUrl?: string
  locale: EmailLocale
}

export function renderSignupEmail({
  token,
  confirmationUrl,
  locale,
}: SignupEmailOptions): RenderedEmail {
  const subject = m['email.auth_signup_subject']({}, { locale })
  const title = m['email.auth_signup_title']({}, { locale })
  const intro = m['email.auth_signup_intro']({}, { locale })
  const cta = m['email.auth_signup_cta']({}, { locale })
  const buttonLabel = m['email.auth_signup_button']({}, { locale })
  const benefitsTitle = m['email.auth_signup_benefits_title']({}, { locale })
  const benefit1 = m['email.auth_signup_benefit_1']({}, { locale })
  const benefit2 = m['email.auth_signup_benefit_2']({}, { locale })
  const benefit3 = m['email.auth_signup_benefit_3']({}, { locale })
  const closing = m['email.auth_signup_closing']({}, { locale })

  const codeBox = token
    ? `
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
    `
    : ''

  const ctaButton = confirmationUrl
    ? renderButton(confirmationUrl, buttonLabel)
    : ''

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

    ${codeBox}

    ${ctaButton}

    <p style="margin: 24px 0 12px 0; font-size: 15px; font-weight: 600; line-height: 1.5; color: #27272a;">
      ${escapeHtml(benefitsTitle)}
    </p>
    <ul style="list-style: none; margin: 0 0 20px 0; padding: 0;">
      <li style="margin: 0 0 10px 0; font-size: 15px; line-height: 1.5; color: #3f3f46;">
        🔍 ${escapeHtml(benefit1)}
      </li>
      <li style="margin: 0 0 10px 0; font-size: 15px; line-height: 1.5; color: #3f3f46;">
        📍 ${escapeHtml(benefit2)}
      </li>
      <li style="margin: 0; font-size: 15px; line-height: 1.5; color: #3f3f46;">
        🤝 ${escapeHtml(benefit3)}
      </li>
    </ul>

    <p style="margin: 20px 0 0 0; font-size: 15px; line-height: 1.6; color: #3f3f46;">
      ${escapeHtml(closing)}
    </p>
  `

  const previewText = token ? `${title}: ${token}` : title

  const html = renderBaseLayout({
    title: subject,
    content,
    locale,
    previewText,
  })

  const plainText = [
    title,
    intro,
    cta,
    token,
    confirmationUrl ? `${buttonLabel}: ${confirmationUrl}` : '',
    benefitsTitle,
    `- 🔍 ${benefit1}`,
    `- 📍 ${benefit2}`,
    `- 🤝 ${benefit3}`,
    closing,
    'https://circulab.pt',
  ]
    .filter(Boolean)
    .join('\n\n')

  return { subject, html, text: plainText }
}
