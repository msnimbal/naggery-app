
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Allow access to verification and security pages
    if (pathname.startsWith('/verify-email') || pathname.startsWith('/security')) {
      return NextResponse.next()
    }

    // Check if user has completed email verification for protected routes
    if (token && !token.emailVerified && !pathname.startsWith('/api/auth')) {
      // Redirect to security page if email not verified
      const url = req.nextUrl.clone()
      url.pathname = '/security'
      url.searchParams.set('step', 'email')
      return NextResponse.redirect(url)
    }

    // For API routes that require full verification, check all requirements
    if (pathname.startsWith('/api/entries') || pathname.startsWith('/api/analytics')) {
      if (token && (!token.emailVerified || !token.isActive)) {
        return NextResponse.json(
          { error: 'Account verification required' },
          { status: 403 }
        )
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect all routes except login, signup, verification, and static files
        const isAuthPage = req.nextUrl.pathname.startsWith('/login') || 
                          req.nextUrl.pathname.startsWith('/signup')
        const isVerificationPage = req.nextUrl.pathname.startsWith('/verify-email')
        const isStaticFile = req.nextUrl.pathname.startsWith('/_next') ||
                           req.nextUrl.pathname.startsWith('/favicon') ||
                           req.nextUrl.pathname.startsWith('/manifest') ||
                           req.nextUrl.pathname.startsWith('/sw.js') ||
                           req.nextUrl.pathname.startsWith('/uploads')
        const isAuthAPI = req.nextUrl.pathname.startsWith('/api/auth')

        if (isAuthPage || isVerificationPage || isStaticFile || isAuthAPI) {
          return true
        }

        return !!token
      }
    }
  }
)

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js).*)'
  ]
}
