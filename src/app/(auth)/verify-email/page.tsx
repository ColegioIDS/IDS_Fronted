// src/app/(auth)/verify-email/page.tsx
/**
 * Página Pública de Verificación de Email
 * Ruta: /verify-email?token=...
 * NO requiere autenticación
 *
 * Esta es la página que se abre cuando el usuario hace clic
 * en el link de verificación del email enviado por el sistema.
 *
 * Flujo:
 * 1. Usuario recibe email con link: /verify-email?token=abc123
 * 2. Hace clic en el link
 * 3. Se abre esta página (sin necesidad de estar autenticado)
 * 4. Se valida el token con el backend
 * 5. Se muestra resultado: éxito, error o ya verificado
 */

'use client';

import dynamic from 'next/dynamic';
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';

const VerifyEmailPublicPage = dynamic(
  () =>
    import('@/components/features/verify-email/public/VerifyEmailPublicPage').then((mod) => ({
      default: mod.VerifyEmailPublicPage,
    })),
  {
    loading: () => <ProfileSkeleton type="meta" />,
    ssr: false,
  }
);

export default function PublicVerifyEmailPage() {
  return <VerifyEmailPublicPage />;
}
