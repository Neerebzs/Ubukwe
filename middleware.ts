import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/', '/auth/signin', '/auth/signup', '/about', '/contact', '/services'];
const publicPrefixes = ['/auth/', '/events', '/_next', '/static', '/api/'];

// Role → allowed route prefixes
const roleRoutes: Record<string, string[]> = {
  admin: ['/admin'],
  event_owner: ['/customer'],
  service_provider: ['/provider'],
};

// Role → home dashboard (redirect after wrong-role access)
const roleDashboard: Record<string, string> = {
  admin: '/admin/dashboard',
  event_owner: '/customer/dashboard',
  service_provider: '/provider/dashboard',
};

function parseToken(token: string): { role?: string; exp?: number } | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    // atob is available in the Edge runtime
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow static assets and public prefixes
  if (
    pathname.includes('.') ||
    publicPrefixes.some(p => pathname.startsWith(p))
  ) {
    return NextResponse.next();
  }

  // Allow exact public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Only enforce on protected prefixes
  const isProtected = Object.values(roleRoutes).flat().some(p => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  // Read token from cookie (set by frontend on login) or Authorization header
  const token =
    request.cookies.get('accessToken')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    const signinUrl = new URL('/auth/signin', request.url);
    signinUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signinUrl);
  }

  const payload = parseToken(token);

  // Expired token
  if (!payload || (payload.exp && payload.exp * 1000 < Date.now())) {
    const signinUrl = new URL('/auth/signin', request.url);
    signinUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signinUrl);
  }

  const role = payload.role as string | undefined;

  // Check role is allowed for this route
  if (role) {
    const allowed = roleRoutes[role] || [];
    const canAccess = allowed.some(p => pathname.startsWith(p));
    if (!canAccess) {
      const dashboard = roleDashboard[role] || '/auth/signin';
      return NextResponse.redirect(new URL(dashboard, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
