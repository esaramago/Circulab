import type { EmailLocale, RenderedEmail } from '../types'
import { renderBaseLayout, escapeHtml } from '../layouts/baseLayout'
import { m } from '@/paraglide/messages.js'

interface ModerationEmailOptions {
  resourceTitle: string
  status: 'accepted' | 'rejected'
  locale?: EmailLocale
}

export function renderModerationEmail({
  resourceTitle,
  status,
  locale = 'pt',
}: ModerationEmailOptions): RenderedEmail {
  const isAccepted = status === 'accepted'

  const subject = isAccepted
    ? m['email.moderation_accepted_subject']({}, { locale })
    : m['email.moderation_rejected_subject']({}, { locale })

  const title = isAccepted
    ? m['email.moderation_accepted_title']({}, { locale })
    : m['email.moderation_rejected_title']({}, { locale })

  const p1 = isAccepted
    ? m['email.moderation_accepted_p1']({ resourceTitle }, { locale })
    : m['email.moderation_rejected_p1']({ resourceTitle }, { locale })

  const p2 = isAccepted
    ? m['email.moderation_accepted_p2']({}, { locale })
    : m['email.moderation_rejected_p2']({}, { locale })

  const titleColor = isAccepted ? '#2e7d32' : '#c62828'

  const content = `
    <h1 style="font-size: 20px; font-weight: 700; color: ${titleColor}; margin: 0 0 16px 0; letter-spacing: -0.3px;">
      ${escapeHtml(title)}
    </h1>
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #3f3f46;">
      ${escapeHtml(p1)}
    </p>
    <p style="margin: 0; font-size: 14px; color: #52525b;">
      ${escapeHtml(p2)}
    </p>
  `

  const html = renderBaseLayout({
    title: subject,
    content,
    locale,
    previewText: title,
  })

  const plainText = `${title}\n\n${p1}\n\n${p2}\n\nhttps://circulab.pt`

  return { subject, html, text: plainText }
}
