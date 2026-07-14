import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Authenticate user check (also refreshes expired session)
  const { data: { user } } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  // 1. Subdomain routing
  const isAdminSubdomain = hostname.startsWith('admin.');

  if (isAdminSubdomain) {
    if (url.pathname === '/') {
      url.pathname = '/login';
    }
    
    // Auth route guards on admin subdomain
    const isAuthRoute = url.pathname === '/login';
    if (!user && !isAuthRoute) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    if (user && isAuthRoute) {
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    return NextResponse.rewrite(url);
  }

  // 2. Path-based routing for local development on localhost:3000
  if (url.pathname === '/admin') {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  const isDashboardRoute = url.pathname.startsWith('/dashboard');
  const isLoginRoute = url.pathname === '/login';

  // Guard dashboard routes (redirect to login)
  if (isDashboardRoute && !user) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Prevent logged in users from loading login screen
  if (isLoginRoute && user) {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
