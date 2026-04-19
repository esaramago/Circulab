import { defineMiddleware } from 'astro:middleware'
import { paraglideMiddleware } from './paraglide/server.js'

export const onRequest = defineMiddleware(async ({ request, locals, redirect }, next) => {
  return paraglideMiddleware(request, async ({ request: req }) => {
    const loggedInUser = getUser()
    if (loggedInUser) {
      locals.user = loggedInUser
    }

    const pathname = new URL(req.url).pathname
    const isPublicRoute = pathname !== '/dashboard'
    if (isPublicRoute || (loggedInUser?.role === 'admin' || loggedInUser?.role === 'moderator')) {
      return next(req)
    }
    return redirect('/login')
  })
})

function getUser() {

  try {
    const user = { id: '1', email: 'test@test.com', role: 'admin' } // TODO: get user from database
    return user

  } catch (error) {
    // Only redirect if it's not a session missing error (user not logged in)
    if (error instanceof Error && !error.message.includes('Session cookie not found')) {
      console.error('Middleware error:', error)
    }

    return undefined
  }
}