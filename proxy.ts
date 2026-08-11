import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
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

  // Create response with modified request headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  
  // Set cookie for persistence
  response.cookies.set('user-region', detectedRegion, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    sameSite: 'lax',
  });

  return response;
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
