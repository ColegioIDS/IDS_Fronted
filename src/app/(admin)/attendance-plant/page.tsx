'use client';

/**
 * ====================================================================
 * ATTENDANCE PLANT PAGE - Página principal
 * ====================================================================
 * 
 * Archivo: src/app/(admin)/attendance-plant/page.tsx
 */

import { AttendancePlantPageContent } from '@/components/features/attendance-plant';
import { usePermissions } from '@/hooks/usePermissions';
import { NoPermissionCard } from '@/components/shared/permissions/NoPermissionCard';
import { MODULES_PERMISSIONS } from '@/constants/modules-permissions';

export default function AttendancePlantPage() {
  const { can } = usePermissions();

  // Verificar permisos
  const canRead = can.do(
    MODULES_PERMISSIONS.ATTENDANCE_PLANT.READ.module,
    MODULES_PERMISSIONS.ATTENDANCE_PLANT.READ.action
  );

  // Si no tiene permiso de lectura, mostrar componente de acceso denegado
  if (!canRead) {
    return (
      <NoPermissionCard
        module={MODULES_PERMISSIONS.ATTENDANCE_PLANT.READ.module}
        action={MODULES_PERMISSIONS.ATTENDANCE_PLANT.READ.action}
        title="Acceso Denegado"
        description="No tienes permisos para acceder a la gestión de asistencia de planta."
        variant="page"
      />
    );
  }

  return <AttendancePlantPageContent />;
}
