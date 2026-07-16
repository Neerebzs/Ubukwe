import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/', '/auth/signin', '/auth/signup', '/about', '/contact', '/services'];
const publicPrefixes = ['/auth/', '/events', '/w/', '/weddings/', '/_next', '/static', '/api/'];

const PLATFORM_HOSTS = (
  process.env.NEXT_PUBLIC_PLATFORM_HOSTS ||
  'localhost,127.0.0.1,vownests.com,www.vownests.com,ubukwe.vercel.app'
).split(',').map((h) => h.trim().toLowerCase());

const API_BASE = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:4000')
  .replace(/\/+$/, '')
  .replace(/\/api\/v1$/, '');

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
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded;
  } catch {
    return null;
  }
}

async function resolveCustomDomain(host: string): Promise<string | null> {
  try {
    const url = `${API_BASE}/api/v1/public/resolve-domain?host=${encodeURIComponent(host)}`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data?.slug ?? null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = (request.headers.get('host') || '').split(':')[0].toLowerCase();

  // Custom domain → rewrite to /w/{slug}
  if (
    host &&
    !PLATFORM_HOSTS.includes(host) &&
    !pathname.startsWith('/w/') &&
    !pathname.startsWith('/weddings/') &&
    !pathname.startsWith('/api/') &&
    !pathname.startsWith('/_next')
  ) {
    const slug = await resolveCustomDomain(host);
    if (slug) {
      const url = request.nextUrl.clone();
      const suffix = pathname === '/' ? '' : pathname;
      url.pathname = `/w/${slug}${suffix}`;
      return NextResponse.rewrite(url);
    }
  }

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

  const token =
    request.cookies.get('accessToken')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    const signinUrl = new URL('/auth/signin', request.url);
    signinUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signinUrl);
  }

  const payload = parseToken(token);

  if (!payload || (payload.exp && payload.exp * 1000 < Date.now())) {
    const signinUrl = new URL('/auth/signin', request.url);
    signinUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signinUrl);
  }

  const role = payload.role as string | undefined;

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
