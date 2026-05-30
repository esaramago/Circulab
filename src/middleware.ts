import { defineMiddleware } from 'astro:middleware'
import { paraglideMiddleware } from './paraglide/server.js'
import { deLocalizeHref, getLocale, localizeHref } from './paraglide/runtime.js'
import { actions } from 'astro:actions'
import { buildLoginRedirectUrl, localizeRedirectPath } from '@/utils/authRedirect'
import { userHasAccess } from './utils/userHasAccess.js'

export const onRequest = defineMiddleware(async ({ request, locals, redirect, callAction }, next) => {
  return paraglideMiddleware(request, async ({ request: delocalizedRequest }) => {

    const pathname = deLocalizeHref(new URL(request.url).pathname)

    // Fill Astro.locals.user with the session user, if the user is logged in
    const getUser = async () => {
      try {
        const { data: user } = await callAction(actions.checkUser, {})
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
    const isAddRoute = pathname.startsWith('/adicionar')
    const isPrivateRoute = isDashboardRoute || isAddRoute

    // If the user is logged in and tries to access the login page, redirect away
    if (locals.user && isLoginRoute) {
      const redirectParam = new URL(request.url).searchParams.get('redirect')
      return redirect(localizeRedirectPath(redirectParam, locals.locale))
    }

    if (isPrivateRoute && !locals.user) {
      const returnPath = pathname + new URL(request.url).search
      return redirect(buildLoginRedirectUrl(returnPath, locals.locale))
    }

    if (isDashboardRoute && locals.user && !userHasAccess(locals.user, 'dashboard')) {
      return redirect(localizeHref('/'))
    }

    return next(delocalizedRequest)
  })
})
