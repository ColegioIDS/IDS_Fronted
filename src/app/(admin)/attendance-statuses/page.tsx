// src/app/(admin)/attendance-statuses/page.tsx

/**
 * ====================================================================
 * ATTENDANCE STATUSES PAGE
 * ====================================================================
 * Punto de entrada para la gestión de estados de asistencia
 * 
 * PERMISOS REQUERIDOS:
 * - read: Listar estados (validado por ProtectedPage)
 * - read-one: Ver detalles de un estado
 * - create: Crear nuevos estados
 * - update: Actualizar estados existentes
 * - delete: Eliminar estados
 */

'use client';

import { usePermissions } from '@/hooks/usePermissions';
import { MODULES_PERMISSIONS } from '@/constants/modules-permissions';
import Breadcrumb from '@/components/common/Breadcrumb';
import { AttendanceStatusesPageContent } from '@/components/features/attendance-statuses';
import { ProtectedPage } from '@/components/shared/permissions/ProtectedPage';

/**
 * Página de Gestión de Estados de Asistencia
 * Ruta: /admin/attendance-statuses
 * 
 * Características:
 * - Listar todos los estados de asistencia
 * - Buscar y filtrar estados
 * - Crear nuevos estados
 * - Editar estados existentes
 * - Eliminar estados
 * - Validaciones en tiempo real
 * - Soporte para dark mode
 */
export default function AdminAttendanceStatusesPage() {
  const { can } = usePermissions();

  // Validar permisos adicionales para pasarlos al contenido
  const canReadOne = can.do(
    MODULES_PERMISSIONS.ATTENDANCE_STATUS.READ_ONE.module,
    MODULES_PERMISSIONS.ATTENDANCE_STATUS.READ_ONE.action
  );

  const canCreate = can.do(
    MODULES_PERMISSIONS.ATTENDANCE_STATUS.CREATE.module,
    MODULES_PERMISSIONS.ATTENDANCE_STATUS.CREATE.action
  );

  const canUpdate = can.do(
    MODULES_PERMISSIONS.ATTENDANCE_STATUS.UPDATE.module,
    MODULES_PERMISSIONS.ATTENDANCE_STATUS.UPDATE.action
  );

  const canDelete = can.do(
    MODULES_PERMISSIONS.ATTENDANCE_STATUS.DELETE.module,
    MODULES_PERMISSIONS.ATTENDANCE_STATUS.DELETE.action
  );

  return (
    <ProtectedPage
      module={MODULES_PERMISSIONS.ATTENDANCE_STATUS.READ.module}
      action={MODULES_PERMISSIONS.ATTENDANCE_STATUS.READ.action}
    >
      <div className="space-y-6">
        <Breadcrumb
          pageTitle=""
          items={[
            { label: "Administración", href: "/admin" },
            { label: "Configuración", href: "#" },
            { label: "Estados de Asistencia", href: "#" },
          ]}
        />
        <AttendanceStatusesPageContent
          canReadOne={canReadOne}
          canCreate={canCreate}
          canUpdate={canUpdate}
          canDelete={canDelete}
        />
      </div>
    </ProtectedPage>
  );
}
