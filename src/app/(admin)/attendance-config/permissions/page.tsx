// src/app/(admin)/attendance-config/permissions/page.tsx

'use client';

import dynamic from 'next/dynamic';
import Breadcrumb from '@/components/common/Breadcrumb';
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';
import { ProtectedPage } from '@/components/shared/permissions/ProtectedPage';
import { ATTENDANCE_PERMISSIONS_PERMISSIONS } from '@/constants/modules-permissions/attendance-permissions';
import { usePermissions } from '@/hooks/usePermissions';

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
 * 
 * Permisos requeridos:
 * - VIEW: Acceso básico a la página
 * - CREATE: Crear nuevos permisos
 * - MODIFY: Editar permisos existentes
 * - DELETE: Eliminar permisos
 */
export default function AttendancePermissionsPage() {
  const { can } = usePermissions();

  const canCreate = can.do(ATTENDANCE_PERMISSIONS_PERMISSIONS.CREATE.module, ATTENDANCE_PERMISSIONS_PERMISSIONS.CREATE.action);
  const canModify = can.do(ATTENDANCE_PERMISSIONS_PERMISSIONS.MODIFY.module, ATTENDANCE_PERMISSIONS_PERMISSIONS.MODIFY.action);
  const canDelete = can.do(ATTENDANCE_PERMISSIONS_PERMISSIONS.DELETE.module, ATTENDANCE_PERMISSIONS_PERMISSIONS.DELETE.action);

  return (
    <ProtectedPage
      module={ATTENDANCE_PERMISSIONS_PERMISSIONS.VIEW.module}
      action={ATTENDANCE_PERMISSIONS_PERMISSIONS.VIEW.action}
    >
      <div className="space-y-4">
        <Breadcrumb 
          pageTitle="Permisos de Asistencia"
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Configuración', href: '/attendance-config' },
            { label: 'Permisos', href: '/attendance-config/permissions' },
          ]} 
        />
        <AttendancePermissionsPageContent 
          canCreate={canCreate}
          canModify={canModify}
          canDelete={canDelete}
        />
      </div>
    </ProtectedPage>
  );
}
