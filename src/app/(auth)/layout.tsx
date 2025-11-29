// src/app/(auth)/layout.tsx
/**
 * Layout para rutas públicas (auth)
 * 
 * Este layout NO debe hacer verificación de autenticación
 * porque las rutas aquí son públicas:
 * - /verify-email?token=...
 * - /signin
 * - /password-reset
 * - etc.
 */

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
