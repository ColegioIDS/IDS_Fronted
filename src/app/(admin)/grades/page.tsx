// src/app/(admin)/grades/page.tsx

'use client';

import { Metadata } from "next";
import { GradesPageContent } from "@/components/features/grades/GradesPageContent";
import Breadcrumb from '@/components/common/Breadcrumb';
import { usePermissions } from '@/hooks/usePermissions';
import { NoPermissionCard } from '@/components/shared/permissions/NoPermissionCard';
import { MODULES_PERMISSIONS } from '@/constants/modules-permissions';

/**
 * 📚 Página de Grados
 * 
 * Permite administrar los grados académicos del sistema:
 * - Ver listado de grados con filtros
 * - Crear, editar y eliminar grados
 * - Activar/desactivar grados
 * - Ver estadísticas de uso
 */
export default function GradesPage() {
  const { can } = usePermissions();

  // Verificar permisos usando las constantes
  const canRead = can.do(
    MODULES_PERMISSIONS.GRADE.READ.module,
    MODULES_PERMISSIONS.GRADE.READ.action
  );
  const canView = can.do(
    MODULES_PERMISSIONS.GRADE.READ_ONE.module,
    MODULES_PERMISSIONS.GRADE.READ_ONE.action
  );
  const canCreate = can.do(
    MODULES_PERMISSIONS.GRADE.CREATE.module,
    MODULES_PERMISSIONS.GRADE.CREATE.action
  );
  const canEdit = can.do(
    MODULES_PERMISSIONS.GRADE.UPDATE.module,
    MODULES_PERMISSIONS.GRADE.UPDATE.action
  );
  const canDelete = can.do(
    MODULES_PERMISSIONS.GRADE.DELETE.module,
    MODULES_PERMISSIONS.GRADE.DELETE.action
  );

  // Si no tiene permiso de lectura, mostrar componente de acceso denegado
  if (!canRead) {
    return (
      <NoPermissionCard
        module={MODULES_PERMISSIONS.GRADE.READ.module}
        action={MODULES_PERMISSIONS.GRADE.READ.action}
        title="Acceso Denegado"
        description="No tienes permisos para acceder a la gestión de grados escolares."
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
          { label: "Grados", href: "#" },
        ]}
      />
      <GradesPageContent
        canView={canView}
        canCreate={canCreate}
        canEdit={canEdit}
        canDelete={canDelete}
      />
    </div>
  );
}