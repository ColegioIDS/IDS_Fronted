// src/app/(admin)/signatures/page.tsx

'use client';

import { SignaturesPageContent } from '@/components/features/signatures';
import { usePermissions } from '@/hooks/usePermissions';
import { NoPermissionCard } from '@/components/shared/permissions/NoPermissionCard';
import { MODULES_PERMISSIONS } from '@/constants/modules-permissions';

export default function SignaturesPage() {
  const { can } = usePermissions();

  // Verificar permisos usando las constantes
  const canRead = can.do(
    MODULES_PERMISSIONS.SIGNATURES.READ.module,
    MODULES_PERMISSIONS.SIGNATURES.READ.action
  );
  const canView = can.do(
    MODULES_PERMISSIONS.SIGNATURES.READ_ONE.module,
    MODULES_PERMISSIONS.SIGNATURES.READ_ONE.action
  );
  const canCreate = can.do(
    MODULES_PERMISSIONS.SIGNATURES.CREATE.module,
    MODULES_PERMISSIONS.SIGNATURES.CREATE.action
  );
  const canEdit = can.do(
    MODULES_PERMISSIONS.SIGNATURES.UPDATE.module,
    MODULES_PERMISSIONS.SIGNATURES.UPDATE.action
  );
  const canDelete = can.do(
    MODULES_PERMISSIONS.SIGNATURES.DELETE.module,
    MODULES_PERMISSIONS.SIGNATURES.DELETE.action
  );
  const canSetDefault = can.do(
    MODULES_PERMISSIONS.SIGNATURES.SET_DEFAULT.module,
    MODULES_PERMISSIONS.SIGNATURES.SET_DEFAULT.action
  );

  // Si no tiene permiso de lectura, mostrar componente de acceso denegado
  if (!canRead) {
    return (
      <NoPermissionCard
        module={MODULES_PERMISSIONS.SIGNATURES.READ.module}
        action={MODULES_PERMISSIONS.SIGNATURES.READ.action}
        title="Acceso Denegado"
        description="No tienes permisos para acceder a la gestión de firmas digitales."
        variant="page"
      />
    );
  }

  return (
    <SignaturesPageContent
      canView={canView}
      canCreate={canCreate}
      canEdit={canEdit}
      canDelete={canDelete}
      canSetDefault={canSetDefault}
      canExport={false}
    />
  );
}

