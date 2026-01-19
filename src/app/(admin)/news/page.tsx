// src/app/(admin)/news/page.tsx

'use client';

import { NewsPageContent } from '@/components/features/news';
import { usePermissions } from '@/hooks/usePermissions';
import { NoPermissionCard } from '@/components/shared/permissions/NoPermissionCard';
import { MODULES_PERMISSIONS } from '@/constants/modules-permissions';

export default function NewsPage() {
  const { can } = usePermissions();

  // Verificar permisos usando las constantes
  const canRead = can.do(
    MODULES_PERMISSIONS.NEWS.READ.module,
    MODULES_PERMISSIONS.NEWS.READ.action
  );

  // Si no tiene permiso de lectura, mostrar componente de acceso denegado
  if (!canRead) {
    return (
      <NoPermissionCard
        module={MODULES_PERMISSIONS.NEWS.READ.module}
        action={MODULES_PERMISSIONS.NEWS.READ.action}
        title="Acceso Denegado"
        description="No tienes permisos para acceder a la gestión de noticias."
        variant="page"
      />
    );
  }

  return <NewsPageContent />;
}
