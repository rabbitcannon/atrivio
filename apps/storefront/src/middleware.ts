import { type NextRequest, NextResponse } from 'next/server';

const PLATFORM_DOMAIN = process.env['NEXT_PUBLIC_PLATFORM_DOMAIN'] || 'atrivio.io';

/**
 * Middleware to resolve storefront from domain
 *
 * Handles:
 * - Subdomains: haunted-mansion.atrivio.io
 * - Custom domains: hauntedmansion.com
 * - Development: localhost with ?storefront= param
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const { pathname, searchParams } = request.nextUrl;

  // Skip static files and API routes
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next();
  }

  let storefrontIdentifier: string | null = null;

  // Development: use ?storefront= query param
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    storefrontIdentifier = searchParams.get('storefront');

    // If no storefront param, try to extract from subdomain (e.g., haunted-mansion.localhost:3002)
    if (!storefrontIdentifier) {
      const subdomain = host.split('.')[0];
      if (subdomain && subdomain !== 'localhost' && !subdomain.includes(':')) {
        storefrontIdentifier = `${subdomain}.${PLATFORM_DOMAIN}`;
      }
    }
  }
  // Production subdomain: xxx.atrivio.io
  else if (host.endsWith(`.${PLATFORM_DOMAIN}`)) {
    // Extract just the slug from subdomain (e.g., haunted-mansion.dev.atrivio.io → haunted-mansion)
    const slug = host.replace(`.${PLATFORM_DOMAIN}`, '').split(':')[0];
    storefrontIdentifier = slug || null;
  }
  // Custom domain: anything else
  else {
    storefrontIdentifier = host;
  }

  // Pass the identifier to the app via request header
  // (response headers go to the client, request headers go to server components)
  const requestHeaders = new Headers(request.headers);
  if (storefrontIdentifier) {
    requestHeaders.set('x-storefront-identifier', storefrontIdentifier);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
};
