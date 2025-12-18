'use client';

import { UsersPageContent } from '@/components/features/users';
import { usePermissions } from '@/hooks/usePermissions';
import { NoPermissionCard } from '@/components/shared/permissions/NoPermissionCard';
import { MODULES_PERMISSIONS } from '@/constants/modules-permissions';

export default function UsersPage() {
  const { can } = usePermissions();

  // Verificar permisos usando las constantes
  const canRead = can.do(
    MODULES_PERMISSIONS.USER.READ.module,
    MODULES_PERMISSIONS.USER.READ.action
  );
  const canView = can.do(
    MODULES_PERMISSIONS.USER.READ_ONE.module,
    MODULES_PERMISSIONS.USER.READ_ONE.action
  );
  const canCreate = can.do(
    MODULES_PERMISSIONS.USER.CREATE.module,
    MODULES_PERMISSIONS.USER.CREATE.action
  );
  const canEdit = can.do(
    MODULES_PERMISSIONS.USER.UPDATE.module,
    MODULES_PERMISSIONS.USER.UPDATE.action
  );
  const canDelete = can.do(
    MODULES_PERMISSIONS.USER.DELETE.module,
    MODULES_PERMISSIONS.USER.DELETE.action
  );
  const canChangePassword = can.do(
    MODULES_PERMISSIONS.USER.CHANGE_PASSWORD.module,
    MODULES_PERMISSIONS.USER.CHANGE_PASSWORD.action
  );
  const canGrantAccess = can.do(
    MODULES_PERMISSIONS.USER.GRANT_ACCESS.module,
    MODULES_PERMISSIONS.USER.GRANT_ACCESS.action
  );
  const canRevokeAccess = can.do(
    MODULES_PERMISSIONS.USER.REVOKE_ACCESS.module,
    MODULES_PERMISSIONS.USER.REVOKE_ACCESS.action
  );
  const canVerifyEmail = can.do(
    MODULES_PERMISSIONS.USER.VERIFY_EMAIL.module,
    MODULES_PERMISSIONS.USER.VERIFY_EMAIL.action
  );
  const canRestore = can.do(
    MODULES_PERMISSIONS.USER.RESTORE.module,
    MODULES_PERMISSIONS.USER.RESTORE.action
  );
  const canAssignRole = can.do(
    MODULES_PERMISSIONS.USER.ASSIGN_ROLE.module,
    MODULES_PERMISSIONS.USER.ASSIGN_ROLE.action
  );
  const canReadStats = can.do(
    MODULES_PERMISSIONS.USER.READ_STATS.module,
    MODULES_PERMISSIONS.USER.READ_STATS.action
  );

  // Si no tiene permiso de lectura, mostrar componente de acceso denegado
  if (!canRead) {
    return (
      <NoPermissionCard
        module={MODULES_PERMISSIONS.USER.READ.module}
        action={MODULES_PERMISSIONS.USER.READ.action}
        title="Acceso Denegado"
        description="No tienes permisos para acceder a la gestión de usuarios."
        variant="page"
      />
    );
  }

  return (
    <UsersPageContent
      canView={canView}
      canCreate={canCreate}
      canEdit={canEdit}
      canDelete={canDelete}
      canChangePassword={canChangePassword}
      canGrantAccess={canGrantAccess}
      canRevokeAccess={canRevokeAccess}
      canVerifyEmail={canVerifyEmail}
      canRestore={canRestore}
      canAssignRole={canAssignRole}
      canReadStats={canReadStats}
    />
  );
}
