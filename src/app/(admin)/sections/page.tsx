// src/app/(admin)/sections/page.tsx

'use client';

import { SectionPageContent } from '@/components/features/sections/SectionPageContent';
import Breadcrumb from '@/components/common/Breadcrumb';
import { usePermissions } from '@/hooks/usePermissions';
import { NoPermissionCard } from '@/components/shared/permissions/NoPermissionCard';
import { MODULES_PERMISSIONS } from '@/constants/modules-permissions';

/**
 * 📚 Página de Secciones
 * 
 * Permite administrar las secciones académicas del sistema:
 * - Ver listado de secciones con filtros
 * - Crear, editar y eliminar secciones
 * - Asignar estudiantes y maestros
 * - Ver estadísticas de secciones
 */
export default function SectionsPage() {
  const { can } = usePermissions();

  // Verificar permisos usando las constantes
  const canRead = can.do(
    MODULES_PERMISSIONS.SECTION.READ.module,
    MODULES_PERMISSIONS.SECTION.READ.action
  );
  const canView = can.do(
    MODULES_PERMISSIONS.SECTION.READ_ONE.module,
    MODULES_PERMISSIONS.SECTION.READ_ONE.action
  );
  const canCreate = can.do(
    MODULES_PERMISSIONS.SECTION.CREATE.module,
    MODULES_PERMISSIONS.SECTION.CREATE.action
  );
  const canEdit = can.do(
    MODULES_PERMISSIONS.SECTION.UPDATE.module,
    MODULES_PERMISSIONS.SECTION.UPDATE.action
  );
  const canDelete = can.do(
    MODULES_PERMISSIONS.SECTION.DELETE.module,
    MODULES_PERMISSIONS.SECTION.DELETE.action
  );

  // Si no tiene permiso de lectura, mostrar componente de acceso denegado
  if (!canRead) {
    return (
      <NoPermissionCard
        module={MODULES_PERMISSIONS.SECTION.READ.module}
        action={MODULES_PERMISSIONS.SECTION.READ.action}
        title="Acceso Denegado"
        description="No tienes permisos para acceder a la gestión de secciones."
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
          { label: "Secciones", href: "#" },
        ]}
      />
      <SectionPageContent
        canView={canView}
        canCreate={canCreate}
        canEdit={canEdit}
        canDelete={canDelete}
      />
    </div>
  );
}