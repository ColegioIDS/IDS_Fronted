// src/app/(admin)/academic-analytics/page.tsx

'use client';

import { AcademicAnalyticsPageContent } from '@/components/features/academic-analytics';
import { usePermissions } from '@/hooks/usePermissions';
import { NoPermissionCard } from '@/components/shared/permissions/NoPermissionCard';
import { MODULES_PERMISSIONS } from '@/constants/modules-permissions';

/**
 * 📊 Página de Analítica Académica
 *
 * Permite visualizar:
 * - Resúmenes académicos de estudiantes por sección
 * - Promedios acumulativos por bimestre
 * - Tendencias académicas
 * - Estado académico de estudiantes
 *
 * Permisos:
 * - read: Ver todos los análisis académicos
 * - read-own: Ver solo datos propios (estudiante/apoderado)
 */
export default function AcademicAnalyticsPage() {
  const { can } = usePermissions();

  // Verificar permisos
  const canRead = can.do(
    MODULES_PERMISSIONS.ACADEMIC_ANALYTICS.READ.module,
    MODULES_PERMISSIONS.ACADEMIC_ANALYTICS.READ.action
  );

  const canReadOwn = can.do(
    MODULES_PERMISSIONS.ACADEMIC_ANALYTICS.READ_OWN.module,
    MODULES_PERMISSIONS.ACADEMIC_ANALYTICS.READ_OWN.action
  );

  // Si no tiene ningún permiso, mostrar acceso denegado
  if (!canRead && !canReadOwn) {
    return (
      <NoPermissionCard
        module={MODULES_PERMISSIONS.ACADEMIC_ANALYTICS.READ.module}
        action={MODULES_PERMISSIONS.ACADEMIC_ANALYTICS.READ.action}
        description="No tienes permisos para acceder a la analítica académica"
      />
    );
  }

  return (
    <AcademicAnalyticsPageContent canView={canRead} canViewOwn={canReadOwn} />
  );
}
