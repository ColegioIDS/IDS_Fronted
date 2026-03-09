// src/app/(admin)/grade-ranges/page.tsx

'use client';

import { usePermissions } from '@/hooks/usePermissions';
import { MODULES_PERMISSIONS } from '@/constants/modules-permissions';
import { NoPermissionCard } from '@/components/shared/permissions/NoPermissionCard';
import Breadcrumb from '@/components/common/Breadcrumb';
import { GradeRangesPageContent } from '@/components/features/grade-ranges';

/**
 * 📊 Página de Rangos de Calificaciones
 * 
 * Permite administrar los rangos de puntuaciones del sistema:
 * - Ver listado de rangos con filtros
 * - Crear, editar y eliminar rangos
 * - Activar/desactivar rangos
 * - Configurar por nivel educativo
 */
export default function GradeRangesPage() {
  const { can } = usePermissions();

  // Verificar permisos usando las constantes
  const canRead = can.do(
    MODULES_PERMISSIONS.GRADE_RANGE.READ.module,
    MODULES_PERMISSIONS.GRADE_RANGE.READ.action
  );
  const canView = can.do(
    MODULES_PERMISSIONS.GRADE_RANGE.READ_ONE.module,
    MODULES_PERMISSIONS.GRADE_RANGE.READ_ONE.action
  );
  const canCreate = can.do(
    MODULES_PERMISSIONS.GRADE_RANGE.CREATE.module,
    MODULES_PERMISSIONS.GRADE_RANGE.CREATE.action
  );
  const canEdit = can.do(
    MODULES_PERMISSIONS.GRADE_RANGE.UPDATE.module,
    MODULES_PERMISSIONS.GRADE_RANGE.UPDATE.action
  );
  const canDelete = can.do(
    MODULES_PERMISSIONS.GRADE_RANGE.DELETE.module,
    MODULES_PERMISSIONS.GRADE_RANGE.DELETE.action
  );

  // Si no tiene permiso de lectura, mostrar componente de acceso denegado
  if (!canRead) {
    return (
      <NoPermissionCard
        module={MODULES_PERMISSIONS.GRADE_RANGE.READ.module}
        action={MODULES_PERMISSIONS.GRADE_RANGE.READ.action}
        title="Acceso Denegado"
        description="No tienes permisos para acceder a la gestión de rangos de calificaciones."
        variant="page"
      />
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        pageTitle=""
        items={[
          { label: "Inicio", href: "/dashboard" },
          { label: "Académico", href: "/academic" },
          { label: "Rangos de Calificaciones", href: "#" },
        ]}
      />
      <GradeRangesPageContent
        canView={canView}
        canCreate={canCreate}
        canEdit={canEdit}
        canDelete={canDelete}
      />
    </div>
  );
}
