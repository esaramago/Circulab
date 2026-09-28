import { deLocalizeHref, localizeHref } from '@/paraglide/runtime.js'

const DEFAULT_REDIRECT = '/mapa'

/**
 * Returns a safe internal path for post-login redirects.
 * Only dashboard routes are allowed.
 */
export function getSafeRedirectPath(
  path: string | null | undefined,
  defaultRedirect = DEFAULT_REDIRECT
): string {
  if (!path) {
    return defaultRedirect
  }

  const delocalized = deLocalizeHref(path.split('?')[0] ?? path)

  const isAllowed =
    delocalized.startsWith('/dashboard/moderacao') ||
    delocalized.startsWith('/backoffice') ||
    delocalized.startsWith('/recursos') ||
    delocalized.startsWith('/mapa')
  if (!isAllowed) {
    return defaultRedirect
  }

  if (delocalized.includes('//') || delocalized.includes(':\\')) {
    return defaultRedirect
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
  locale?: string,
  defaultRedirect = DEFAULT_REDIRECT
): string {
  return localizeHref(getSafeRedirectPath(path, defaultRedirect), locale ? { locale } : undefined)
}
