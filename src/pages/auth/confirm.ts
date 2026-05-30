import type { APIRoute } from 'astro'
import type { EmailOtpType } from '@supabase/supabase-js'
import { localizeHref } from '@/paraglide/runtime.js'
import { createClient } from '@/utils/supabase'
import { getSafeRedirectPath, localizeRedirectPath } from '@/utils/authRedirect'
function loginErrorUrl(locale: App.Locals['locale']): string {
  const url = new URL(localizeHref('/login', locale ? { locale } : undefined), 'http://local')
  url.searchParams.set('error', 'auth')
  return `${url.pathname}${url.search}`
}

export const GET: APIRoute = async ({ request, cookies, redirect, locals }) => {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null
  const code = requestUrl.searchParams.get('code')
  const next = getSafeRedirectPath(requestUrl.searchParams.get('next'))
  const locale = locals.locale

  const supabase = createClient({ request, cookies })

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return redirect(localizeRedirectPath(next, locale))
    }
    return redirect(loginErrorUrl(locale))
  }

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    if (!error) {
      return redirect(localizeRedirectPath(next, locale))
    }
  }

  return redirect(loginErrorUrl(locale))
}
