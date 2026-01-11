'use client';

import { AssignmentsPageContent } from '@/components/features/assignments/AssignmentsPageContent';
import { usePermissions } from '@/hooks/usePermissions';
import { NoPermissionCard } from '@/components/shared/permissions/NoPermissionCard';
import { MODULES_PERMISSIONS } from '@/constants/modules-permissions';

export default function AssignmentsPage() {
  const { can } = usePermissions();

  // Verificar permisos usando las constantes
  const canRead = can.do(
    MODULES_PERMISSIONS.ASSIGNMENTS.READ.module,
    MODULES_PERMISSIONS.ASSIGNMENTS.READ.action
  );
  const canCreate = can.do(
    MODULES_PERMISSIONS.ASSIGNMENTS.CREATE.module,
    MODULES_PERMISSIONS.ASSIGNMENTS.CREATE.action
  );
  const canUpdate = can.do(
    MODULES_PERMISSIONS.ASSIGNMENTS.UPDATE.module,
    MODULES_PERMISSIONS.ASSIGNMENTS.UPDATE.action
  );
  const canDelete = can.do(
    MODULES_PERMISSIONS.ASSIGNMENTS.DELETE.module,
    MODULES_PERMISSIONS.ASSIGNMENTS.DELETE.action
  );

  // Si no tiene permiso de lectura, mostrar componente de acceso denegado
  if (!canRead) {
    return (
      <NoPermissionCard
        module={MODULES_PERMISSIONS.ASSIGNMENTS.READ.module}
        action={MODULES_PERMISSIONS.ASSIGNMENTS.READ.action}
        title="Acceso Denegado"
        description="No tienes permisos para acceder a la gestión de tareas y asignaciones."
        variant="page"
      />
    );
  }

  return <AssignmentsPageContent />;
}
