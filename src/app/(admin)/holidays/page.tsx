// src/app/(admin)/holidays/page.tsx

'use client';

import { HolidaysPageContent } from '@/components/features/holidays';
import { usePermissions } from '@/hooks/usePermissions';
import { NoPermissionCard } from '@/components/shared/permissions/NoPermissionCard';
import { MODULES_PERMISSIONS } from '@/constants/modules-permissions';

export default function HolidaysPage() {
  const { can } = usePermissions();

  // Verificar permisos usando las constantes
  const canRead = can.do(
    MODULES_PERMISSIONS.HOLIDAY.READ.module,
    MODULES_PERMISSIONS.HOLIDAY.READ.action
  );
  const canView = can.do(
    MODULES_PERMISSIONS.HOLIDAY.READ_ONE.module,
    MODULES_PERMISSIONS.HOLIDAY.READ_ONE.action
  );
  const canCreate = can.do(
    MODULES_PERMISSIONS.HOLIDAY.CREATE.module,
    MODULES_PERMISSIONS.HOLIDAY.CREATE.action
  );
  const canEdit = can.do(
    MODULES_PERMISSIONS.HOLIDAY.UPDATE.module,
    MODULES_PERMISSIONS.HOLIDAY.UPDATE.action
  );
  const canDelete = can.do(
    MODULES_PERMISSIONS.HOLIDAY.DELETE.module,
    MODULES_PERMISSIONS.HOLIDAY.DELETE.action
  );

  // Si no tiene permiso de lectura, mostrar componente de acceso denegado
  if (!canRead) {
    return (
      <NoPermissionCard
        module={MODULES_PERMISSIONS.HOLIDAY.READ.module}
        action={MODULES_PERMISSIONS.HOLIDAY.READ.action}
        title="Acceso Denegado"
        description="No tienes permisos para acceder a la gestión de días festivos."
        variant="page"
      />
    );
  }

  return (
    <HolidaysPageContent
      canView={canView}
      canCreate={canCreate}
      canEdit={canEdit}
      canDelete={canDelete}
      canExport={false}
    />
  );
}
