import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const secretKey = process.env.SECRET_KEY
  const providedKey = request.nextUrl.searchParams.get('key') || request.headers.get('x-secret-key')

  if (!secretKey || providedKey !== secretKey) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*', '/reports'],
}
