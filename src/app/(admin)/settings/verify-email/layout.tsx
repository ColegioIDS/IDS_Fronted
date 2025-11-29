// src/app/(admin)/settings/verify-email/layout.tsx
/**
 * Layout para rutas de Verificación de Emails
 *
 * Este es un Server Component que exporta metadata.
 * Los Client Components NO pueden exportar metadata.
 *
 * Ruta: /admin/settings/verify-email
 *
 * Metadata:
 * - title: Verificación de Emails | Admin
 * - description: Gestiona la verificación de emails de los usuarios
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verificación de Emails | Admin',
  description: 'Gestiona la verificación de emails de los usuarios',
};

export default function VerifyEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
