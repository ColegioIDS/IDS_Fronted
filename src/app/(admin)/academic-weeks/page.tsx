// src/app/(admin)/academic-weeks/page.tsx

'use client';

import { AcademicWeekPageContent } from '@/components/features/academic-weeks';
import { usePermissions } from '@/hooks/usePermissions';
import { NoPermissionCard } from '@/components/shared/permissions/NoPermissionCard';
import { MODULES_PERMISSIONS } from '@/constants/modules-permissions';

export default function AcademicWeeksPage() {
  const { can } = usePermissions();

  // Verificar permisos usando las constantes
  const canRead = can.do(
    MODULES_PERMISSIONS.ACADEMIC_WEEK.READ.module,
    MODULES_PERMISSIONS.ACADEMIC_WEEK.READ.action
  );
  const canView = can.do(
    MODULES_PERMISSIONS.ACADEMIC_WEEK.READ_ONE.module,
    MODULES_PERMISSIONS.ACADEMIC_WEEK.READ_ONE.action
  );
  const canCreate = can.do(
    MODULES_PERMISSIONS.ACADEMIC_WEEK.CREATE.module,
    MODULES_PERMISSIONS.ACADEMIC_WEEK.CREATE.action
  );
  const canEdit = can.do(
    MODULES_PERMISSIONS.ACADEMIC_WEEK.UPDATE.module,
    MODULES_PERMISSIONS.ACADEMIC_WEEK.UPDATE.action
  );
  const canDelete = can.do(
    MODULES_PERMISSIONS.ACADEMIC_WEEK.DELETE.module,
    MODULES_PERMISSIONS.ACADEMIC_WEEK.DELETE.action
  );

  // Si no tiene permiso de lectura, mostrar componente de acceso denegado
  if (!canRead) {
    return (
      <NoPermissionCard
        module={MODULES_PERMISSIONS.ACADEMIC_WEEK.READ.module}
        action={MODULES_PERMISSIONS.ACADEMIC_WEEK.READ.action}
        title="Acceso Denegado"
        description="No tienes permisos para acceder a la gestión de semanas académicas."
        variant="page"
      />
    );
  }

  return (
    <AcademicWeekPageContent
      canView={canView}
      canCreate={canCreate}
      canEdit={canEdit}
      canDelete={canDelete}
      canExport={false}
    />
  );
}