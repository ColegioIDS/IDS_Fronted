// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // ✅ Permitir todo - dejar que el cliente (React) maneje la autenticación
  // El middleware del servidor no tiene acceso confiable a las cookies HTTP-only
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};