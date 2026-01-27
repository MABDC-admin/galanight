import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Handle admin API routes
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    // Let admin API routes handle their own authentication
    return NextResponse.next()
  }

  // Handle reports page and API
  const secretKey = process.env.SECRET_KEY
  const providedKey = request.nextUrl.searchParams.get('key') || request.headers.get('x-secret-key')

  if (!secretKey || providedKey !== secretKey) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/reports', '/api/reports'],
}
