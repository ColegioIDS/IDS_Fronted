'use client';

import { EnrollmentsPageContent } from '@/components/features/enrollments';
import Breadcrumb from '@/components/common/Breadcrumb';
import { usePermissions } from '@/hooks/usePermissions';
import { NoPermissionCard } from '@/components/shared/permissions/NoPermissionCard';
import { MODULES_PERMISSIONS } from '@/constants/modules-permissions';

/**
 * 📋 Página de Matrículas
 * 
 * Permite administrar las matrículas de estudiantes:
 * - Ver listado de matrículas con filtros
 * - Crear nuevas matrículas
 * - Cambiar estado (activa, suspendida, inactiva)
 * - Cambiar grado y sección
 * - Transferir a nuevo ciclo académico
 * - Ver estadísticas de matrículas
 * - Exportar datos
 */
export default function EnrollmentPage() {
  const { can } = usePermissions();

  // Verificar permisos usando las constantes
  const canRead = can.do(
    MODULES_PERMISSIONS.ENROLLMENT.READ.module,
    MODULES_PERMISSIONS.ENROLLMENT.READ.action
  );
  const canView = can.do(
    MODULES_PERMISSIONS.ENROLLMENT.READ_ONE.module,
    MODULES_PERMISSIONS.ENROLLMENT.READ_ONE.action
  );
  const canCreate = can.do(
    MODULES_PERMISSIONS.ENROLLMENT.CREATE.module,
    MODULES_PERMISSIONS.ENROLLMENT.CREATE.action
  );
  const canUpdateStatus = can.do(
    MODULES_PERMISSIONS.ENROLLMENT.UPDATE_STATUS.module,
    MODULES_PERMISSIONS.ENROLLMENT.UPDATE_STATUS.action
  );
  const canUpdatePlacement = can.do(
    MODULES_PERMISSIONS.ENROLLMENT.UPDATE_PLACEMENT.module,
    MODULES_PERMISSIONS.ENROLLMENT.UPDATE_PLACEMENT.action
  );
  const canTransfer = can.do(
    MODULES_PERMISSIONS.ENROLLMENT.TRANSFER.module,
    MODULES_PERMISSIONS.ENROLLMENT.TRANSFER.action
  );
  const canDelete = can.do(
    MODULES_PERMISSIONS.ENROLLMENT.DELETE.module,
    MODULES_PERMISSIONS.ENROLLMENT.DELETE.action
  );
  const canViewStats = can.do(
    MODULES_PERMISSIONS.ENROLLMENT.VIEW_STATISTICS.module,
    MODULES_PERMISSIONS.ENROLLMENT.VIEW_STATISTICS.action
  );
  const canExport = can.do(
    MODULES_PERMISSIONS.ENROLLMENT.EXPORT.module,
    MODULES_PERMISSIONS.ENROLLMENT.EXPORT.action
  );

  // Si no tiene permiso de lectura, mostrar componente de acceso denegado
  if (!canRead) {
    return (
      <NoPermissionCard
        module={MODULES_PERMISSIONS.ENROLLMENT.READ.module}
        action={MODULES_PERMISSIONS.ENROLLMENT.READ.action}
        title="Acceso Denegado"
        description="No tienes permisos para acceder a la gestión de matrículas."
        variant="page"
      />
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        pageTitle="Matrículas"
        items={[
          { label: "Inicio", href: "/dashboard" },
          { label: "Académico", href: "/academic" },
          { label: "Matrículas", href: "#" },
        ]}
      />
      <EnrollmentsPageContent
        canView={canView}
        canCreate={canCreate}
        canUpdateStatus={canUpdateStatus}
        canUpdatePlacement={canUpdatePlacement}
        canTransfer={canTransfer}
        canDelete={canDelete}
        canViewStats={canViewStats}
        canExport={canExport}
      />
    </div>
  );
}