
import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Add any middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect all routes except login, signup, and static files
        const isAuthPage = req.nextUrl.pathname.startsWith('/login') || 
                          req.nextUrl.pathname.startsWith('/signup')
        const isStaticFile = req.nextUrl.pathname.startsWith('/_next') ||
                           req.nextUrl.pathname.startsWith('/favicon') ||
                           req.nextUrl.pathname.startsWith('/manifest') ||
                           req.nextUrl.pathname.startsWith('/sw.js') ||
                           req.nextUrl.pathname.startsWith('/uploads')

        if (isAuthPage || isStaticFile) {
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
