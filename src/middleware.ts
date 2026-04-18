import { defineMiddleware } from 'astro:middleware'

export const onRequest = defineMiddleware(async ({ request, locals, redirect, url }, next) => {
  // Skip middleware for login page and API endpoints
  const isLogin = url.pathname === '/login'
  const isAPIRoute = url.pathname.startsWith('/api/')
  if (isLogin || isAPIRoute) {
    return next()
  }

  try {
    const user = { id: '1', email: 'test@test.com' } // TODO: get user from database
    locals.user = user

    if (url.pathname === '/') {
      return next()
    }
  } catch (error) {
    // Only redirect if it's not a session missing error (user not logged in)
    if (error instanceof Error && !error.message.includes('Session cookie not found')) {
      console.error('Middleware error:', error)
    }

    // Don't redirect to login if on homepage
    if (url.pathname === '/') {
      return next()
    }

    return redirect('/login')
  }

  return next()
})