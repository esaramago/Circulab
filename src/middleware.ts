import { defineMiddleware } from 'astro:middleware'
import { paraglideMiddleware } from './paraglide/server.js'
import { deLocalizeHref, getLocale, localizeHref } from './paraglide/runtime.js'
import { actions } from 'astro:actions'

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

    // If the user is logged in and tries to access the login page, redirect to the dashboard
    if (locals.user && isLoginRoute) {
      return redirect(localizeHref('/dashboard'))
    }

    if (isDashboardRoute && !locals.user) {
      return redirect(localizeHref('/login'))
    }

    if (isDashboardRoute && locals.user) {
      const hasAccessToDashboard = locals.user?.role_id === 2 || locals.user?.role_id === 3
      if (hasAccessToDashboard) {
        return next(delocalizedRequest)
      }
      return redirect(localizeHref('/'))
    }

    return next(delocalizedRequest)
  })
})
