import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { CookieOptions } from '@supabase/ssr';

type CookieToSet = { name: string; value: string; options?: CookieOptions };

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
  const supabaseAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Middleware] Missing Supabase env vars');
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }: CookieToSet) =>
          request.cookies.set(name, value)
        );
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
  const isDashboard = request.nextUrl.pathname === '/dashboard';
  const isOrgPath = request.nextUrl.pathname.match(/^\/[a-f0-9-]{36}/);
  const isOrgManagement = request.nextUrl.pathname.startsWith('/organizations');
  const isProtectedPath = isDashboard || isOrgPath || isOrgManagement;

  // Auth pages that logged-in users shouldn't see
  const authPaths = ['/login', '/signup', '/forgot-password'];
  const isAuthPath = authPaths.some(path => request.nextUrl.pathname.startsWith(path));

  if (!user && isProtectedPath) {
    // Redirect unauthenticated users to login
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', request.nextUrl.pathname);
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
