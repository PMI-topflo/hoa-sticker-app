import { NextRequest, NextResponse } from 'next/server'
import { verifySession, SESSION_COOKIE } from '@/lib/session'

const PROTECTED: Record<string, { persona: 'owner' | 'board' | 'staff'; loginPath: string }> = {
  '/my-account': { persona: 'owner', loginPath: '/' },
  '/board':      { persona: 'board', loginPath: '/' },
  '/admin':      { persona: 'staff', loginPath: '/admin/login' },
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // /admin/login is the staff login page — never intercept it
  if (pathname === '/admin/login') return NextResponse.next()

  const match = Object.entries(PROTECTED).find(([prefix]) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
  if (!match) return NextResponse.next()
  const [, route] = match

  const token   = req.cookies.get(SESSION_COOKIE)?.value
  const session = token ? verifySession(token) : null

  if (!session) {
    const dest = req.nextUrl.clone()
    dest.pathname = route.loginPath
    dest.search   = ''
    // For owner/board, pass ?return= so the homepage can resume their flow
    if (route.loginPath === '/') {
      dest.searchParams.set('return', pathname + req.nextUrl.search)
    }
    return NextResponse.redirect(dest)
  }

  // Staff can access everything; other personas must match exactly
  if (session.persona !== 'staff' && session.persona !== route.persona) {
    const homeUrl = req.nextUrl.clone()
    homeUrl.pathname = '/'
    homeUrl.search   = ''
    return NextResponse.redirect(homeUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/my-account/:path*', '/board/:path*', '/admin/:path*'],
}
