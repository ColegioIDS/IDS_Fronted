// src/app/(admin)/attendance-config/permissions/page.tsx

'use client';

import dynamic from 'next/dynamic';
import Breadcrumb from '@/components/common/Breadcrumb';
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';

const AttendancePermissionsPageContent = dynamic(
  () => import('@/components/features/attendance-permissions').then(mod => ({ 
    default: mod.AttendancePermissionsPageContent 
  })),
  {
    loading: () => <ProfileSkeleton type="meta" />,
    ssr: false,
  }
);

/**
 * Página de Permisos de Asistencia
 * Ruta: /attendance-config/permissions
 * 
 * Características:
 * - Gestionar permisos de roles para estados de asistencia
 * - Ver matriz de permisos
 * - Crear/editar permisos
 * - Eliminar permisos
 * - Dashboard de estadísticas
 * - Visualización de matriz de permisos
 * - Soporta dark mode
 */
export default function AttendancePermissionsPage() {
  return (
    <div className="space-y-4">
      <Breadcrumb 
        pageTitle="Permisos de Asistencia"
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Configuración', href: '/attendance-config' },
          { label: 'Permisos', href: '/attendance-config/permissions' },
        ]} 
      />
      <AttendancePermissionsPageContent />
    </div>
  );
}
