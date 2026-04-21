import { defineMiddleware } from 'astro:middleware'
import { paraglideMiddleware } from './paraglide/server.js'
import { actions } from 'astro:actions'

export const onRequest = defineMiddleware(async ({ request, locals, redirect, callAction }, next) => {
  return paraglideMiddleware(request, async ({ request: req }) => {

    const pathname = new URL(req.url).pathname
    const isLoginRoute = pathname.startsWith('/login')

    try {
      const { data: loggedInUser } = await callAction(actions.getUser, {})

      if (loggedInUser) {
        locals.user = {
          id: loggedInUser.id || '',
          email: loggedInUser.email || '',
          role: loggedInUser.role,
        }
      }

      const isDashboardRoute = pathname.startsWith('/dashboard')
      const isPublicRoute = !isDashboardRoute
      const hasAccessToDashboard = loggedInUser?.role === 'admin' || loggedInUser?.role === 'moderator'
      if (isPublicRoute || (isDashboardRoute && hasAccessToDashboard)) {
        return next(req)
      }
      return redirect('/login')
    } catch (error) {
      if (isLoginRoute) {
        return next(req)
      }
      return redirect('/login')
    }
  })
})