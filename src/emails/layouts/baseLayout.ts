import type { EmailLocale } from '../types'
import { m } from '@/paraglide/messages.js'
const siteUrl = (import.meta.env.SITE || process.env.SITE || 'https://circulab.pt').replace(/\/+$/, '')
const siteHost = siteUrl.replace(/^https?:\/\//, '')

export function escapeHtml(text?: string | null): string {
  if (!text) return ''
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export function renderButton(href: string, label: string): string {
  return `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
      <tr>
        <td align="left">
          <a href="${escapeHtml(href)}" target="_blank" style="display: inline-block; background-color: #549C89; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 12px 28px; border-radius: 6px; text-align: center; mso-padding-alt: 0;">
            <!--[if mso]><i style="letter-spacing: 28px; mso-font-width: -100%;" hidden>&nbsp;</i><![endif]-->
            <span style="mso-text-raise: 15pt;">${escapeHtml(label)}</span>
            <!--[if mso]><i style="letter-spacing: 28px; mso-font-width: -100%" hidden>&nbsp;</i><![endif]-->
          </a>
        </td>
      </tr>
    </table>
  `
}

interface BaseLayoutOptions {
  title: string
  content: string
  locale: EmailLocale
  previewText?: string
}

export function renderBaseLayout({
  title,
  content,
  locale,
  previewText = '',
}: BaseLayoutOptions): string {
  const teamSignature = m['email.team_signature']({}, { locale })
  const automatedNotice = m['email.footer_automated']({}, { locale })
  const sentFrom = m['email.footer_sent_from']({}, { locale })
  const visitWebsite = m['email.visit_website']({}, { locale })

  const safePreviewText = previewText
    ? `<div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${escapeHtml(previewText)}</div>`
    : ''

  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${escapeHtml(title)}</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    @media only screen and (max-width: 620px) {
      .card { width: 100% !important; border-radius: 0 !important; }
      .wrapper { padding: 12px 6px !important; }
      .inner-content { padding: 24px 18px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #18181b;">
  ${safePreviewText}
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" class="wrapper" style="padding: 36px 12px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px;">
          <!-- Header -->
          <tr>
            <td align="left" style="padding: 0 12px 18px 12px;">
              <a href="https://circulab.pt" target="_blank" style="text-decoration: none;">
                <img src="https://circulab.pt/img/logo.png" alt="circulab" height="32" style="display: block; height: 32px; width: auto; max-width: 160px; border: 0; outline: none; font-size: 24px; font-weight: 800; color: #549C89; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; letter-spacing: -0.5px;">
              </a>
            </td>
          </tr>
          <!-- Main Card -->
          <tr>
            <td>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="card" style="background-color: #ffffff; border-radius: 8px; border: 1px solid #e4e4e7; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <!-- Green Accent Top Bar -->
                <tr>
                  <td height="4" style="background-color: #549C89; line-height: 4px; font-size: 4px;">&nbsp;</td>
                </tr>
                <tr>
                  <td class="inner-content" style="padding: 32px 32px 28px 32px; font-size: 15px; line-height: 1.6; color: #27272a;">
                    ${content}

                    <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #f4f4f5; font-size: 14px; color: #52525b;">
                      <p style="margin: 0;">${escapeHtml(teamSignature)}</p>
                      <p style="margin: 4px 0 0 0;">
                        <a href="${siteUrl}" target="_blank" style="color: #549C89; text-decoration: none; font-weight: 500;">${escapeHtml(siteHost)}</a>
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 24px 12px 0 12px; font-size: 12px; line-height: 1.5; color: #71717a;">
              <p style="margin: 0 0 6px 0;">${escapeHtml(sentFrom)}</p>
              <p style="margin: 0 0 6px 0;">${escapeHtml(automatedNotice)}</p>
              <p style="margin: 0;">
                <a href="${siteUrl}" target="_blank" style="color: #71717a; text-decoration: underline;">${escapeHtml(visitWebsite)}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
