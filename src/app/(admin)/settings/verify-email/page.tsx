// src/app/(admin)/settings/verify-email/page.tsx
/**
 * 📧 Página de Gestión de Verificación de Emails
 *
 * Ruta: /admin/settings/verify-email
 * Acceso: Autenticado + Permiso verify-email:read
 *
 * Características:
 * ✅ Ver estado de verificación del usuario autenticado
 * ✅ Solicitar/reenviar email de verificación
 * ✅ Gestionar usuarios sin verificar (Admin)
 * ✅ Ver estadísticas de verificación (Admin)
 * ✅ Filtros avanzados y búsqueda
 * ✅ Dark mode compatible
 * ✅ Responsive design
 *
 * Componentes:
 * - VerifyEmailPageContent (Orquestador principal)
 * - VerifyEmailStatus (Estado usuario)
 * - UnverifiedUsersTable (Tabla admin)
 * - VerificationStats (Estadísticas)
 * - VerifyEmailFilters (Filtros)
 */

'use client';

import dynamic from 'next/dynamic';
import Breadcrumb from '@/components/common/Breadcrumb';
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';
import { MailCheck } from 'lucide-react';

const VerifyEmailPageContent = dynamic(
  () =>
    import('@/components/features/verify-email/admin').then((mod) => ({
      default: mod.VerifyEmailPageContent,
    })),
  {
    loading: () => <ProfileSkeleton type="meta" />,
    ssr: false,
  }
);

export default function AdminVerifyEmailPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb
        pageTitle="Verificación de Emails"
        icon={<MailCheck className="h-6 w-6" />}
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Configuración', href: '/settings' },
          { label: 'Verificación de Emails', href: '/settings/verify-email' },
        ]}
      />
      <VerifyEmailPageContent />
    </div>
  );
}
