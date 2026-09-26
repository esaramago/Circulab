import { createClient as createSupabaseJsClient, type SupabaseClient } from '@supabase/supabase-js'
import { createServerClient, parseCookieHeader } from '@supabase/ssr'
import type { AstroCookies } from 'astro'
import type { Database } from '../types/supabase'

function getSupabaseUrl(): string {
  const rawSupabaseUrl =
    import.meta.env.PUBLIC_SUPABASE_URL ||
    (typeof process !== 'undefined'
      ? process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
      : undefined) ||
    `https://${import.meta.env.PUBLIC_SUPABASE_PROJECT_ID || (typeof process !== 'undefined' ? process.env.PUBLIC_SUPABASE_PROJECT_ID || process.env.SUPABASE_PROJECT_ID : '')}.supabase.co`
  return (rawSupabaseUrl || '').replace(/\/+$/, '')
}

function getSupabasePublishableKey(): string {
  return (
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY ||
    (typeof process !== 'undefined'
      ? process.env.PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
      : '') ||
    ''
  )
}

let _supabase: SupabaseClient<Database> | null = null

function getSupabase(): SupabaseClient<Database> {
  if (!_supabase) {
    const url = getSupabaseUrl()
    const key = getSupabasePublishableKey()
    if (!key) {
      throw new Error(
        'Supabase anon key is required. Please set PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_ANON_KEY) in your environment variables.'
      )
    }
    _supabase = createSupabaseJsClient<Database>(url, key)
  }
  return _supabase
}

/** Base client (e.g. server actions, scripts). Prefer `createClient` for cookie-aware auth in pages/middleware. */
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop, receiver) {
    const client = getSupabase()
    const value = Reflect.get(client, prop, receiver)
    return typeof value === 'function' ? value.bind(client) : value
  },
})

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
  const url = getSupabaseUrl()
  const key = getSupabasePublishableKey()
  return createServerClient(
    url,
    key,
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