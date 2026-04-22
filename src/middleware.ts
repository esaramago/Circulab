import { defineMiddleware } from 'astro:middleware'
import { paraglideMiddleware } from './paraglide/server.js'
import { actions } from 'astro:actions'

export const onRequest = defineMiddleware(async ({ request, locals, redirect, callAction }, next) => {
  return paraglideMiddleware(request, async ({ request: req }) => {

    const pathname = new URL(req.url).pathname
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
            return next(req) // Continue to page
          }
          return redirect('/login')
        }

      }

      // is public route
      return next(req) // Continue to page
      
    } catch (error) {
      if (isLoginRoute) {
        return next(req) // Continue to page
      }
      return redirect('/login')
    }
  })
})