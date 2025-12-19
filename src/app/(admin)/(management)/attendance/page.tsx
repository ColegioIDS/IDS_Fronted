/**
 * ====================================================================
 * ATTENDANCE PAGE
 * ====================================================================
 * Punto de entrada del módulo de asistencia
 * 
 * PERMISOS REQUERIDOS:
 * - read: Listar registros de asistencia (validado por ProtectedPage)
 * - read-one: Ver detalles de un registro
 * - read-config: Acceder a configuración
 * - read-stats: Ver estadísticas
 * - create: Crear registros
 * - create-bulk: Crear en lote
 * - update: Actualizar registros
 * - delete: Eliminar registros
 * - validate: Validar datos de asistencia
 */

'use client';

import { usePermissions } from '@/hooks/usePermissions';
import { MODULES_PERMISSIONS } from '@/constants/modules-permissions';
import { AttendancePageContent } from '@/components/features/attendance/AttendancePageContent';
import { ProtectedPage } from '@/components/shared/permissions/ProtectedPage';

export default function AttendancePage() {
  const { can } = usePermissions();

  // Validar permisos adicionales para pasarlos al contenido
  const canReadOne = can.do(
    MODULES_PERMISSIONS.ATTENDANCE.READ_ONE.module,
    MODULES_PERMISSIONS.ATTENDANCE.READ_ONE.action
  );

  const canReadConfig = can.do(
    MODULES_PERMISSIONS.ATTENDANCE.READ_CONFIG.module,
    MODULES_PERMISSIONS.ATTENDANCE.READ_CONFIG.action
  );

  const canReadStats = can.do(
    MODULES_PERMISSIONS.ATTENDANCE.READ_STATS.module,
    MODULES_PERMISSIONS.ATTENDANCE.READ_STATS.action
  );

  const canCreate = can.do(
    MODULES_PERMISSIONS.ATTENDANCE.CREATE.module,
    MODULES_PERMISSIONS.ATTENDANCE.CREATE.action
  );

  const canCreateBulk = can.do(
    MODULES_PERMISSIONS.ATTENDANCE.CREATE_BULK.module,
    MODULES_PERMISSIONS.ATTENDANCE.CREATE_BULK.action
  );

  const canUpdate = can.do(
    MODULES_PERMISSIONS.ATTENDANCE.UPDATE.module,
    MODULES_PERMISSIONS.ATTENDANCE.UPDATE.action
  );

  const canDelete = can.do(
    MODULES_PERMISSIONS.ATTENDANCE.DELETE.module,
    MODULES_PERMISSIONS.ATTENDANCE.DELETE.action
  );

  const canValidate = can.do(
    MODULES_PERMISSIONS.ATTENDANCE.VALIDATE.module,
    MODULES_PERMISSIONS.ATTENDANCE.VALIDATE.action
  );

  return (
    <ProtectedPage
      module={MODULES_PERMISSIONS.ATTENDANCE.READ.module}
      action={MODULES_PERMISSIONS.ATTENDANCE.READ.action}
    >
      <main className="space-y-6 p-6">
        <AttendancePageContent
          canReadOne={canReadOne}
          canReadConfig={canReadConfig}
          canReadStats={canReadStats}
          canCreate={canCreate}
          canCreateBulk={canCreateBulk}
          canUpdate={canUpdate}
          canDelete={canDelete}
          canValidate={canValidate}
        />
      </main>
    </ProtectedPage>
  );
}
