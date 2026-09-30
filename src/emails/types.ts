export type EmailLocale = 'pt' | 'en'

export interface BrevoEmailResult {
  success: boolean
  skipped?: boolean
  messageId?: string
  error?: string
}

export interface SendEmailPayload {
  to: string | { email: string; name?: string }[]
  subject: string
  html: string
  text?: string
  replyTo?: { email: string; name?: string }
}

export interface RenderedEmail {
  subject: string
  html: string
  text?: string
}

export interface SupabaseAuthHookEvent {
  user: {
    id: string
    aud?: string
    role?: string
    email?: string
    phone?: string
    app_metadata?: Record<string, unknown>
    user_metadata?: {
      language?: string
      locale?: string
      name?: string
      full_name?: string
      [key: string]: unknown
    }
  }
  email_data: {
    token: string
    token_hash: string
    redirect_to?: string
    email_action_type: 'signup' | 'recovery' | 'magiclink' | 'invite' | 'email_change' | 'reauthentication'
    site_url?: string
    token_new?: string
    token_hash_new?: string
    old_email?: string
    new_email?: string
  }
}
