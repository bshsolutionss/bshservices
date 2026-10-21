import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { lookupRole } from '@/lib/admin/roles';
import { canView, canWrite, moduleForApi, moduleForPath, restrictionReason } from '@/lib/permissions';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/services" || pathname.startsWith("/services/")) {
    const canonicalUrl = request.nextUrl.clone();
    canonicalUrl.pathname = `/Services${pathname.slice("/services".length)}`;
    return NextResponse.redirect(canonicalUrl, 308);
  }

  // Admin API: sign-in AND role are enforced here once, for every route, so a
  // restricted role is rejected before any handler runs (hiding a button is not security).
  if (pathname.startsWith('/api/admin')) {
    const { response, authenticated, email } = await updateSession(request, new Headers(request.headers));
    if (!authenticated) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
    const info = await lookupRole(email);
    if (!info) {
      return NextResponse.json({ ok: false, error: 'Your account does not have access to the admin panel.' }, { status: 403 });
    }
    const area = moduleForApi(pathname);
    if (area) {
      const isWrite = request.method !== 'GET' && request.method !== 'HEAD';
      const allowed = isWrite ? canWrite(info.role, area) : canView(info.role, area);
      if (!allowed) {
        return NextResponse.json(
          { ok: false, error: restrictionReason(info.role, area, isWrite ? 'write' : 'view') },
          { status: 403 }
        );
      }
    }
    return response;
  }

  // 1. Check for manual override via cookie
  let detectedRegion: "GLOBAL" | "PK" = "GLOBAL";
  const cookieRegion = request.cookies.get('user-region')?.value;

  if (cookieRegion === 'PK' || cookieRegion === 'GLOBAL') {
    detectedRegion = cookieRegion as "GLOBAL" | "PK";
  } else {
    // 2. Check Vercel Header
    const country = request.headers.get('x-vercel-ip-country');

    if (country === 'PK') {
      detectedRegion = 'PK';
    } else if (!country && process.env.NODE_ENV === 'development') {
      // 3. Fallback for local development if no header is present
      // We'll try a lightweight detection or just default to PK if we can't find anything
      // but for now, let's keep it simple and check if we can get a hint from Accept-Language
      const acceptLanguage = request.headers.get('accept-language') || '';
      if (acceptLanguage.includes('PK') || acceptLanguage.includes('ur')) {
        detectedRegion = 'PK';
      }
    }
  }

  // To pass data to the page (server components), we need to set it on the request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-region', detectedRegion);

  // Supabase session refresh — builds on `requestHeaders` so the region
  // header forwarding survives even when Supabase needs to rebuild the
  // response to attach refreshed auth cookies.
  // Only /admin needs it: public pages never read the session, and the
  // check used to add an auth round trip to every marketing-site request.
  const isAdminRoute = pathname.startsWith('/admin');
  let response: NextResponse;
  let authenticated = false;
  let email: string | null = null;
  if (isAdminRoute) {
    ({ response, authenticated, email } = await updateSession(request, requestHeaders));
  } else {
    response = NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Set cookie for persistence
  response.cookies.set('user-region', detectedRegion, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    sameSite: 'lax',
  });

  // Admin route guard — redirect unauthenticated requests to the login page.
  // (Admin mutation API routes independently re-check auth themselves too;
  // this is the fast, page-level guard.)
  if (isAdminRoute && pathname !== '/admin/login' && !authenticated) {
    const loginUrl = new URL('/admin/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Role guard for pages: a signed-in person only reaches the screens their role allows.
  if (isAdminRoute && authenticated && pathname !== '/admin/login' && pathname !== '/admin/restricted') {
    const info = await lookupRole(email);
    if (!info) {
      return NextResponse.redirect(new URL('/admin/restricted?reason=norole', request.url));
    }
    const area = moduleForPath(pathname);
    if (area && !canView(info.role, area)) {
      return NextResponse.redirect(new URL(`/admin/restricted?module=${area}`, request.url));
    }
  }

  return response;
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/api/admin/:path*',
  ],
};
