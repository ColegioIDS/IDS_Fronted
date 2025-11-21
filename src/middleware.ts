// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard', '/profile', '/admin'];
const authRoutes = ['/signin', '/signup'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('authToken')?.value;
  const pathname = request.nextUrl.pathname;

  // ✅ Si está en ruta auth sin token, permitir
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (token) {
      // Si ya tiene token, redirigir a dashboard
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // ✅ Si está en ruta protegida sin token, redirigir a signin
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = '/signin';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};