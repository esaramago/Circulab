import { createClient as createSupabaseJsClient } from '@supabase/supabase-js'
import { createServerClient, parseCookieHeader } from '@supabase/ssr'
import type { AstroCookies } from 'astro'
import type { Database } from '../types/supabase'

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL
const supabasePublishableKey = import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY

/** Base client (e.g. server actions, scripts). Prefer `createClient` for cookie-aware auth in pages/middleware. */
export const supabase = createSupabaseJsClient<Database>(supabaseUrl, supabasePublishableKey)

type CookieNameValue = { name: string; value: string }

export function createClient({
  request,
  cookies,
  response,
}: {
  request: Request
  cookies: AstroCookies
  /** e.g. `Astro.response` — needed so `setAll` can apply no-cache headers from the auth client */
  response?: { headers: Headers }
}) {
  return createServerClient(
    supabaseUrl,
    supabasePublishableKey,
    {
      cookies: {
        getAll(): CookieNameValue[] {
          return parseCookieHeader(
            request.headers.get('Cookie') ?? ''
          ).filter((c): c is CookieNameValue => typeof c.value === 'string')
        },
        setAll(cookiesToSet, responseHeaders) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookies.set(name, value, options)
          )
          if (response) {
            for (const [key, value] of Object.entries(responseHeaders)) {
              response.headers.set(key, value)
            }
          }
        },
      },
    }
  )
}