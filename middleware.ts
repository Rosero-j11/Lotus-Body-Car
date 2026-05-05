import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/app/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  // Update Supabase session
  await updateSession(request);
  
  const { pathname } = request.nextUrl;
  const isAuthenticated = !!request.cookies.get('lotus_auth')?.value;
  const userRole = request.cookies.get('lotus_role')?.value;

  // Protect seller routes
  if (pathname.startsWith('/seller')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (userRole !== 'seller' && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Protect cart route
  if (pathname.startsWith('/cart')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Protect profile route
  if (pathname.startsWith('/profile')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Redirect authenticated users away from login/register
  if ((pathname === '/login' || pathname === '/register') && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/seller/:path*', '/admin/:path*', '/cart/:path*', '/profile/:path*', '/login', '/register'],
};
