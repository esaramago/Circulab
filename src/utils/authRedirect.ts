import { deLocalizeHref, localizeHref } from '@/paraglide/runtime.js'

const DEFAULT_REDIRECT = '/dashboard'

/**
 * Returns a safe internal path for post-login redirects.
 * Only dashboard routes are allowed.
 */
export function getSafeRedirectPath(path: string | null | undefined): string {
  if (!path) {
    return DEFAULT_REDIRECT
  }

  const delocalized = deLocalizeHref(path.split('?')[0] ?? path)

  const isAllowed = delocalized.startsWith('/dashboard') || delocalized.startsWith('/backoffice')
  if (!isAllowed) {
    return DEFAULT_REDIRECT
  }

  if (delocalized.includes('//') || delocalized.includes(':\\')) {
    return DEFAULT_REDIRECT
  }

  return delocalized
}

export function buildLoginRedirectUrl(
  returnPath: string,
  locale?: string
): string {
  const loginHref = localizeHref('/login', locale ? { locale } : undefined)
  const url = new URL(loginHref, 'http://local')
  url.searchParams.set('redirect', getSafeRedirectPath(returnPath))
  return `${url.pathname}${url.search}`
}

export function localizeRedirectPath(
  path: string | null | undefined,
  locale?: string
): string {
  return localizeHref(getSafeRedirectPath(path), locale ? { locale } : undefined)
}
