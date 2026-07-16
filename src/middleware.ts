import { defineMiddleware } from 'astro:middleware'
import { paraglideMiddleware } from './paraglide/server.js'
import { deLocalizeHref, getLocale, localizeHref } from './paraglide/runtime.js'
import { checkUser } from '@/actions/auth/checkUser'
import { buildLoginRedirectUrl, localizeRedirectPath } from '@/utils/authRedirect'
import { userHasAccess } from './utils/userHasAccess.js'

export const onRequest = defineMiddleware(async ({ request, locals, redirect, callAction }, next) => {
  return paraglideMiddleware(request, async ({ request: delocalizedRequest }) => {

    const pathname = deLocalizeHref(new URL(request.url).pathname)

    // Fill Astro.locals.user with the session user, if the user is logged in
    const getUser = async () => {
      try {
        const { data: user } = await callAction(checkUser, {})
        return user || undefined
      } catch (error) {
        return undefined
      }
    }

    // set Astro.locals
    locals.user = await getUser()
    locals.locale = getLocale()

    const isLoginRoute = pathname.startsWith('/login')
    const isDashboardRoute = pathname.startsWith('/dashboard')
    const isResourceRoute = pathname.startsWith('/recursos')
    const isBackofficeRoute = pathname.startsWith('/backoffice')
    const isPrivateRoute = isDashboardRoute || isResourceRoute || isBackofficeRoute

    // If the user is logged in and tries to access the login page, redirect away
    if (locals.user && isLoginRoute) {
      const redirectParam = new URL(request.url).searchParams.get('redirect')
      const target = localizeRedirectPath(redirectParam, locals.locale)
      console.log(`[Middleware] Logged in user on login route. Redirecting to: ${target}`)
      return redirect(target)
    } else if (isPrivateRoute && !locals.user) {
      const returnPath = pathname + new URL(request.url).search
      const target = buildLoginRedirectUrl(returnPath, locals.locale)
      console.log(`[Middleware] Guest user on private route. Redirecting to login: ${target}`)
      return redirect(target)
    } else if (isDashboardRoute && locals.user && !userHasAccess(locals.user, 'dashboard')) {
      console.log('[Middleware] User not authorized for dashboard. Redirecting to /')
      return redirect(localizeHref('/'))
    } else if (isBackofficeRoute && locals.user && !userHasAccess(locals.user, 'backoffice')) {
      console.log('[Middleware] User not authorized for backoffice. Redirecting to /')
      return redirect(localizeHref('/'))
    }

    return next(delocalizedRequest)
  })
})
