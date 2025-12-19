// src/app/(admin)/attendance-config/page.tsx

/**
 * ====================================================================
 * ATTENDANCE CONFIG PAGE
 * ====================================================================
 * Punto de entrada para la configuración del módulo de asistencia
 * 
 * PERMISOS REQUERIDOS:
 * - view: Ver configuración (validado por ProtectedPage)
 * - create: Crear nueva configuración
 * - modify: Modificar configuración existente
 * - delete: Eliminar configuración
 * - restore: Restaurar configuración eliminada
 */

'use client';

import { usePermissions } from '@/hooks/usePermissions';
import { MODULES_PERMISSIONS } from '@/constants/modules-permissions';
import Breadcrumb from '@/components/common/Breadcrumb';
import { AttendanceConfigPage } from '@/components/features/attendance-config';
import { ProtectedPage } from '@/components/shared/permissions/ProtectedPage';

/**
 * Página de Configuración de Asistencia
 * Ruta: /admin/attendance-config
 * 
 * Características:
 * - Ver configuración activa del sistema
 * - Editar parámetros de asistencia
 * - Restaurar a valores por defecto
 * - Eliminar configuración
 * - Validaciones en tiempo real
 * - Soporte para dark mode
 * - Tema de colores consistente con attendance
 */
export default function AdminAttendanceConfigPage() {
  const { can } = usePermissions();

  // Validar permisos adicionales para pasarlos al contenido
  const canCreate = can.do(
    MODULES_PERMISSIONS.ATTENDANCE_CONFIG.CREATE.module,
    MODULES_PERMISSIONS.ATTENDANCE_CONFIG.CREATE.action
  );

  const canModify = can.do(
    MODULES_PERMISSIONS.ATTENDANCE_CONFIG.MODIFY.module,
    MODULES_PERMISSIONS.ATTENDANCE_CONFIG.MODIFY.action
  );

  const canDelete = can.do(
    MODULES_PERMISSIONS.ATTENDANCE_CONFIG.DELETE.module,
    MODULES_PERMISSIONS.ATTENDANCE_CONFIG.DELETE.action
  );

  const canRestore = can.do(
    MODULES_PERMISSIONS.ATTENDANCE_CONFIG.RESTORE.module,
    MODULES_PERMISSIONS.ATTENDANCE_CONFIG.RESTORE.action
  );

  return (
    <ProtectedPage
      module={MODULES_PERMISSIONS.ATTENDANCE_CONFIG.VIEW.module}
      action={MODULES_PERMISSIONS.ATTENDANCE_CONFIG.VIEW.action}
    >
      <div className="space-y-6">
        <Breadcrumb
          pageTitle=""
          items={[
            { label: "Administración", href: "/admin" },
            { label: "Configuración", href: "#" },
            { label: "Asistencia", href: "#" },
          ]}
        />
        <AttendanceConfigPage
          canCreate={canCreate}
          canModify={canModify}
          canDelete={canDelete}
          canRestore={canRestore}
        />
      </div>
    </ProtectedPage>
  );
}