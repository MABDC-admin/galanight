import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Skip protection for admin routes - they handle their own authentication
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    return NextResponse.next()
  }

  // Apply secret key protection to reports and other protected routes
  const secretKey = process.env.SECRET_KEY

  if (!secretKey) {
    console.warn('WARNING: SECRET_KEY is not defined in environment variables. Middleware will block all protected routes.')
  }

  const providedKey = request.nextUrl.searchParams.get('key') || request.headers.get('x-secret-key')

  if (!secretKey || providedKey !== secretKey) {
    // Return JSON response for API routes
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    // Return text response for pages
    return new NextResponse('Forbidden', { status: 403 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/reports', '/api/:path*'],
}
