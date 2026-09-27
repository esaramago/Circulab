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

export interface ModerationEmailInput {
  toEmail: string
  resourceTitle: string
  status: 'accepted' | 'rejected'
}

export async function sendModerationEmail({
  toEmail,
  resourceTitle,
  status,
}: ModerationEmailInput): Promise<BrevoEmailResult> {
  const apiKey =
    import.meta.env.BREVO_API_KEY ||
    process.env.BREVO_API_KEY

  const fromEmail =
    import.meta.env.CONTACT_FROM_EMAIL ||
    process.env.CONTACT_FROM_EMAIL ||
    'info@circulab.pt'

  const fromName =
    import.meta.env.CONTACT_FROM_NAME ||
    process.env.CONTACT_FROM_NAME ||
    'Circulab'

  if (!apiKey) {
    const msg = 'BREVO_API_KEY não está configurada'
    console.warn(`[Brevo] ${msg}`)
    return {
      success: false,
      skipped: true,
      error: msg,
    }
  }

  const isAccepted = status === 'accepted'
  const emailSubject = isAccepted
    ? `[Circulab] O teu recurso foi aceite!`
    : `[Circulab] Atualização sobre o teu recurso sugerido`

  const textContent = isAccepted
    ? `Olá!\n\nTemos boas notícias: o recurso "${resourceTitle}" sugerido por ti foi revisto pela equipa de moderação e já está disponível no mapa do Circulab.\n\nObrigado pela tua contribuição para a comunidade!\n\nEquipa Circulab\nhttps://circulab.pt`
    : `Olá!\n\nAgradecemos a tua sugestão para o recurso "${resourceTitle}".\n\nApós análise pela nossa equipa de moderação, informamos que o recurso não foi aceite para publicação no mapa.\n\nSe tiveres dúvidas ou pretenderes submeter mais informações, não hesites em contactar-nos.\n\nEquipa Circulab\nhttps://circulab.pt`

  const htmlContent = `
    <div style="font-family: sans-serif; font-size: 15px; color: #333; line-height: 1.5; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: ${isAccepted ? '#2e7d32' : '#c62828'}; border-bottom: 2px solid #e0e0e0; padding-bottom: 8px;">
        ${isAccepted ? 'Recurso aceite!' : 'Atualização sobre o recurso sugerido'}
      </h2>
      <p>Olá,</p>
      <p>
        ${
          isAccepted
            ? `Temos boas notícias: o teu recurso <strong>"${escapeHtml(resourceTitle)}"</strong> foi revisto pela equipa de moderação e já se encontra publicado no mapa do Circulab.`
            : `Agradecemos a tua contribuição. Após revisão pela equipa de moderação, o recurso <strong>"${escapeHtml(resourceTitle)}"</strong> não foi aceite para publicação no mapa.`
        }
      </p>
      <p style="margin-top: 24px;">
        ${
          isAccepted
            ? 'Obrigado por ajudares a mapear recursos agroecológicos e de economia circular!'
            : 'Se tiveres alguma dúvida ou pretenderes partilhar mais informações, entra em contacto connosco.'
        }
      </p>
      <div style="margin-top: 30px; padding-top: 16px; border-top: 1px solid #eee; font-size: 13px; color: #666;">
        <p style="margin: 0;">Equipa <strong>Circulab</strong></p>
        <p style="margin: 4px 0 0 0;"><a href="https://circulab.pt" style="color: #2e7d32;">circulab.pt</a></p>
      </div>
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
            email: toEmail,
          },
        ],
        subject: emailSubject,
        textContent,
        htmlContent,
      }),
    })

    const responseBody = await response.json().catch(() => ({}))

    if (!response.ok) {
      console.error('[Brevo] Failed to send moderation email:', response.status, responseBody)
      return {
        success: false,
        error: responseBody?.message || JSON.stringify(responseBody) || `HTTP ${response.status}`,
      }
    }

    console.log('[Brevo] Moderation email sent successfully to', toEmail, 'MessageId:', responseBody?.messageId)
    return {
      success: true,
      messageId: responseBody?.messageId,
    }
  } catch (error: any) {
    console.error('[Brevo] Moderation email error:', error)
    return {
      success: false,
      error: error.message || 'Network error while contacting Brevo API',
    }
  }
}


