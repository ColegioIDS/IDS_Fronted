// src/app/(admin)/erica-history/page.tsx

'use client';

import { EricaHistoryPageContent } from '@/components/features/erica-history/EricaHistoryPageContent';
import Breadcrumb from '@/components/common/Breadcrumb';
import { usePermissions } from '@/hooks/usePermissions';
import { NoPermissionCard } from '@/components/shared/permissions/NoPermissionCard';
import { MODULES_PERMISSIONS } from '@/constants/modules-permissions';

/**
 * 📊 Página de Historial ERICA
 * 
 * Permite consultar y analizar el historial de evaluaciones ERICA:
 * - Filtrado por bimestre, semana, grado, sección y curso
 * - Visualización de evaluaciones por dimensión ERICA
 * - Análisis de desempeño por estudiante
 * - Estadísticas de evaluaciones
 * - Vista completa de bimestre con todas las semanas
 */
export default function EricaHistoryPage() {
  const { can } = usePermissions();

  // Verificar permisos usando las constantes
  const canRead = can.do(
    MODULES_PERMISSIONS.ERICA_HISTORY.READ.module,
    MODULES_PERMISSIONS.ERICA_HISTORY.READ.action
  );

  // Si no tiene permiso de lectura, mostrar componente de acceso denegado
  if (!canRead) {
    return (
      <NoPermissionCard
        module={MODULES_PERMISSIONS.ERICA_HISTORY.READ.module}
        action={MODULES_PERMISSIONS.ERICA_HISTORY.READ.action}
        title="Acceso Denegado"
        description="No tienes permisos para acceder al historial de evaluaciones ERICA."
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
          { label: "ERICA", href: "/erica" },
          { label: "Historial", href: "#" },
        ]}
      />
      <EricaHistoryPageContent />
    </div>
  );
}
