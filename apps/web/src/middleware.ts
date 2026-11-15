import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('se_access_token')?.value;

  // Protect Console and Portal routes from unauthenticated access
  if (pathname.startsWith('/console') || pathname.startsWith('/portal')) {
    if (!token || token.trim() === '') {
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/console/:path*', '/portal/:path*'],
};
