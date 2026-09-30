import type { EmailLocale, RenderedEmail } from '../../types'
import { renderBaseLayout, renderButton, escapeHtml } from '../../layouts/baseLayout'
import { m } from '@/paraglide/messages.js'

interface InviteEmailOptions {
  confirmationUrl: string
  locale: EmailLocale
}

export function renderInviteEmail({
  confirmationUrl,
  locale,
}: InviteEmailOptions): RenderedEmail {
  const subject = m['email.auth_invite_subject']({}, { locale })
  const title = m['email.auth_invite_title']({}, { locale })
  const intro = m['email.auth_invite_intro']({}, { locale })
  const benefitsTitle = m['email.auth_invite_benefits_title']({}, { locale })
  const benefit1 = m['email.auth_invite_benefit_1']({}, { locale })
  const benefit2 = m['email.auth_invite_benefit_2']({}, { locale })
  const benefit3 = m['email.auth_invite_benefit_3']({}, { locale })
  const cta = m['email.auth_invite_cta']({}, { locale })
  const buttonLabel = m['email.auth_invite_button']({}, { locale })
  const fallbackLabel = m['email.auth_invite_fallback']({}, { locale })
  const communityNote = m['email.auth_invite_community_note']({}, { locale })

  const content = `
    <h1 style="font-size: 20px; font-weight: 700; color: #18181b; margin: 0 0 16px 0; letter-spacing: -0.3px;">
      ${escapeHtml(title)}
    </h1>
    <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #3f3f46;">
      ${escapeHtml(intro)}
    </p>
    <p style="margin: 0 0 12px 0; font-size: 15px; font-weight: 600; line-height: 1.5; color: #27272a;">
      ${escapeHtml(benefitsTitle)}
    </p>
    <ul style="list-style: none; margin: 0 0 20px 0; padding: 0;">
      <li style="margin: 0 0 10px 0; font-size: 15px; line-height: 1.5; color: #3f3f46;">
        ✅ ${escapeHtml(benefit1)}
      </li>
      <li style="margin: 0 0 10px 0; font-size: 15px; line-height: 1.5; color: #3f3f46;">
        ✅ ${escapeHtml(benefit2)}
      </li>
      <li style="margin: 0; font-size: 15px; line-height: 1.5; color: #3f3f46;">
        ✅ ${escapeHtml(benefit3)}
      </li>
    </ul>
    <p style="margin: 20px 0 0 0; font-size: 15px; line-height: 1.6; color: #3f3f46;">
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

    <p style="margin: 24px 0 0 0; font-size: 15px; line-height: 1.6; color: #3f3f46;">
      ${escapeHtml(communityNote)}
    </p>
  `

  const html = renderBaseLayout({
    title: subject,
    content,
    locale,
    previewText: title,
  })

  const plainText = `${title}\n\n${intro}\n\n${benefitsTitle}\n- ✅ ${benefit1}\n- ✅ ${benefit2}\n- ✅ ${benefit3}\n\n${cta}\n\n${confirmationUrl}\n\n${communityNote}\n\nhttps://circulab.pt`

  return { subject, html, text: plainText }
}
