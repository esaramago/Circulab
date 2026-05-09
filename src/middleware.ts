import { defineMiddleware } from 'astro:middleware'
import { paraglideMiddleware } from './paraglide/server.js'
import { deLocalizeHref, getLocale } from './paraglide/runtime.js'
import { actions } from 'astro:actions'

export const onRequest = defineMiddleware(async ({ request, locals, redirect, callAction }, next) => {
  return paraglideMiddleware(request, async ({ request: localizedRequest }) => {

    const pathname = deLocalizeHref(new URL(request.url).pathname)
    locals.locale = getLocale() // set Astro.locals.locale
    const isLoginRoute = pathname.startsWith('/login')

    try {

      const isDashboardRoute = pathname.startsWith('/dashboard')

      if (isDashboardRoute) {
        const { data: sessionUser } = await callAction(actions.checkUser, {})
        if (sessionUser) {
          locals.user = sessionUser

          const hasAccessToDashboard =
            locals.user?.role_id === 2 || locals.user?.role_id === 3

          if (hasAccessToDashboard) {
            return next(localizedRequest)
          }
          return redirect('/login')
        }
      }

      return next(localizedRequest)

    } catch (error) {
      if (isLoginRoute) {
        return next(localizedRequest)
      }
      return redirect('/login')
    }
  })
})