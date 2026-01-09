import type { CookieOptions } from '@supabase/ssr';
import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

type CookieToSet = { name: string; value: string; options?: CookieOptions };

// Platform domain configuration
const PLATFORM_DOMAIN = process.env['NEXT_PUBLIC_PLATFORM_DOMAIN'] || 'atrivio.io';
const MAIN_DOMAINS = [
  PLATFORM_DOMAIN,
  `www.${PLATFORM_DOMAIN}`,
  'localhost',
  'localhost:3000',
  'localhost:3002',
];

/**
 * Check if a host is a storefront subdomain or custom domain
 * Returns the identifier (slug for subdomains, full domain for custom domains)
 */
function getStorefrontIdentifier(host: string, searchParams: URLSearchParams): string | null {
  // Check for query parameter (local development): ?storefront=slug
  const storefrontParam = searchParams.get('storefront');
  if (storefrontParam) {
    return storefrontParam;
  }

  // Remove port if present for comparison
  const hostWithoutPort = host.split(':')[0];

  // Check if it's the main platform domain
  if (MAIN_DOMAINS.some(d => host === d || host.startsWith(`${d}:`))) {
    return null;
  }

  // Check if it's a platform subdomain (e.g., haunted-mansion.atrivio.io)
  if (host.endsWith(`.${PLATFORM_DOMAIN}`)) {
    const subdomain = host.replace(`.${PLATFORM_DOMAIN}`, '').split(':')[0];
    // Ignore common subdomains that aren't storefronts
    if (['www', 'api', 'app', 'admin', 'docs', 'staging', 'dev'].includes(subdomain)) {
      return null;
    }
    return subdomain;
  }

  // Check for localhost subdomain pattern (e.g., haunted-mansion.localhost:3000)
  if (hostWithoutPort.endsWith('.localhost')) {
    const subdomain = hostWithoutPort.replace('.localhost', '');
    if (subdomain && subdomain !== 'www') {
      return subdomain;
    }
    return null;
  }

  // It's a custom domain (not on platform domain)
  // Return the full domain as the identifier
  return host;
}

/**
 * Map storefront paths to internal routes
 */
function getStorefrontRewrite(pathname: string, identifier: string): string | null {
  // /tickets → main storefront page with ticket listing
  if (pathname === '/tickets' || pathname === '/tickets/') {
    return `/s/${identifier}`;
  }

  // /checkout → checkout form
  if (pathname === '/checkout' || pathname === '/checkout/') {
    return `/s/${identifier}/checkout`;
  }

  // /checkout/success → success page
  if (pathname === '/checkout/success' || pathname === '/checkout/success/') {
    return `/s/${identifier}/checkout/success`;
  }

  // Homepage on storefront domain → redirect to /tickets
  if (pathname === '/' || pathname === '') {
    return `/s/${identifier}`;
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams;

  // Check if this is a storefront request (subdomain, custom domain, or ?storefront= param)
  const storefrontIdentifier = getStorefrontIdentifier(host, searchParams);

  if (storefrontIdentifier) {
    const rewritePath = getStorefrontRewrite(pathname, storefrontIdentifier);

    if (rewritePath) {
      // Rewrite to internal storefront route
      const url = request.nextUrl.clone();
      url.pathname = rewritePath;
      return NextResponse.rewrite(url);
    }

    // For other paths on storefront domains, continue normally
    // This allows static assets, API routes, etc. to work
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
  const supabaseAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }: CookieToSet) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }: CookieToSet) => {
          if (options) {
            supabaseResponse.cookies.set(name, value, options);
          } else {
            supabaseResponse.cookies.set(name, value);
          }
        });
      },
    },
  });

  // Refresh the session to update cookies
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes - dashboard, org paths like /b0000000-..., and /organizations/*
  const isDashboard = pathname === '/dashboard';
  const isOrgPath = pathname.match(/^\/[a-f0-9-]{36}/);
  const isOrgManagement = pathname.startsWith('/organizations');
  const isProtectedPath = isDashboard || isOrgPath || isOrgManagement;

  // Auth pages that logged-in users shouldn't see
  const authPaths = ['/login', '/signup', '/forgot-password'];
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

  if (!user && isProtectedPath) {
    // Redirect unauthenticated users to login
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthPath) {
    // Redirect authenticated users away from auth pages based on role
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_super_admin')
      .eq('id', user.id)
      .single();

    const url = request.nextUrl.clone();
    url.pathname = profile?.is_super_admin ? '/admin' : '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
