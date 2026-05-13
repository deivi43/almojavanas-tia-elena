import { NextResponse, type NextRequest } from 'next/server'

const SESSION_COOKIE = 'admin_session'

async function verifyToken(token: string): Promise<boolean> {
  const lastDot = token.lastIndexOf('.')
  if (lastDot === -1) return false
  const payload = token.slice(0, lastDot)
  const secret = process.env.SESSION_SECRET ?? 'dev-secret-change-me'
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  const expected = `${payload}.${Buffer.from(sig).toString('base64url')}`
  return expected === token
}

export async function proxy(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isLoginPage = request.nextUrl.pathname === '/admin/login'

  if (!isAdminRoute) return NextResponse.next()

  const token = request.cookies.get(SESSION_COOKIE)?.value
  const authenticated = token ? await verifyToken(token) : false

  if (!isLoginPage && !authenticated) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  if (isLoginPage && authenticated) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
