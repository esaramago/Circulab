import type { ContactFormInput } from '@/types/domain/contact'

interface BrevoEmailResult {
  success: boolean
  skipped?: boolean
  messageId?: string
  error?: string
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, '<br/>')
}

export async function sendContactEmail({
  name,
  email,
  subject,
  message,
}: ContactFormInput): Promise<BrevoEmailResult> {
  const apiKey =
    import.meta.env.BREVO_API_KEY ||
    process.env.BREVO_API_KEY

  const toEmail =
    import.meta.env.CONTACT_TO_EMAIL ||
    process.env.CONTACT_TO_EMAIL ||
    'info@circulab.pt'

  const fromEmail =
    import.meta.env.CONTACT_FROM_EMAIL ||
    process.env.CONTACT_FROM_EMAIL ||
    'info@circulab.pt'

  const fromName =
    import.meta.env.CONTACT_FROM_NAME ||
    process.env.CONTACT_FROM_NAME ||
    'Circulab'

  console.log('[Brevo] Attempting to send email. Key configured:', !!apiKey, '| From:', fromEmail, '| To:', toEmail)

  if (!apiKey) {
    const msg = 'SMTP_KEY (ou BREVO_API_KEY) não está configurada no .env'
    console.warn(`[Brevo] ${msg}`)
    return {
      success: false,
      skipped: true,
      error: msg,
    }
  }

  const emailSubject = `[Contacto Circulab] ${subject}`
  const textContent = `Novo contacto recebido através do site Circulab:\n\nNome: ${name}\nEmail: ${email}\nAssunto: ${subject}\n\nMensagem:\n${message}`

  const htmlContent = `
    <div style="font-family: sans-serif; font-size: 15px; color: #333; line-height: 1.5; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2e7d32; border-bottom: 2px solid #e0e0e0; padding-bottom: 8px;">Novo contacto recebido no Circulab</h2>
      <p><strong>Nome:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
      <p><strong>Assunto:</strong> ${escapeHtml(subject)}</p>
      <div style="margin-top: 20px; padding: 16px; background-color: #f9f9f9; border-left: 4px solid #2e7d32; border-radius: 4px;">
        <h4 style="margin-top: 0; margin-bottom: 8px;">Mensagem:</h4>
        <p style="white-space: pre-wrap; margin: 0;">${escapeHtml(message)}</p>
      </div>
      <p style="font-size: 12px; color: #888; margin-top: 30px;">Esta mensagem foi enviada a partir do formulário de contactos em circulab.pt.</p>
    </div>
  `

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
        to: [
          {
            name: 'Circulab Team',
            email: toEmail,
          },
        ],
        replyTo: {
          name,
          email,
        },
        subject: emailSubject,
        textContent,
        htmlContent,
      }),
    })

    const responseBody = await response.json().catch(() => ({}))

    if (!response.ok) {
      console.error('[Brevo] Failed to send email:', response.status, responseBody)
      return {
        success: false,
        error: responseBody?.message || JSON.stringify(responseBody) || `HTTP ${response.status}`,
      }
    }

    console.log('[Brevo] Email sent successfully! MessageId:', responseBody?.messageId)
    return {
      success: true,
      messageId: responseBody?.messageId,
    }
  } catch (error: any) {
    console.error('[Brevo] Network or dispatch error:', error)
    return {
      success: false,
      error: error.message || 'Network error while contacting Brevo API',
    }
  }
}

