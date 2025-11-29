// src/app/(auth)/verify-email/layout.tsx
/**
 * Layout para rutas de Verificación de Email
 *
 * Este es un Server Component que exporta metadata.
 * Los Client Components NO pueden exportar metadata.
 *
 * Ruta: /verify-email
 *
 * Metadata:
 * - title: Verificar Email | IDS
 * - description: Verifica tu email para activar tu cuenta
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verificar Email | IDS',
  description: 'Verifica tu email para activar tu cuenta',
};

export default function VerifyEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
