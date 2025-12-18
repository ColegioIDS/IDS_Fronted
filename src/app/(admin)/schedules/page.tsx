// src/app/(admin)/schedules/page.tsx
'use client';

import { usePermissions } from '@/hooks/usePermissions';
import { NoPermissionCard } from '@/components/shared/permissions/NoPermissionCard';
import { MODULES_PERMISSIONS } from '@/constants/modules-permissions';
import dynamic from 'next/dynamic';
import Breadcrumb from '@/components/common/Breadcrumb';
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';

const SchedulesContent = dynamic(
  () => import('@/components/features/schedules').then(mod => ({ default: mod.SchedulesPageContent })),
  {
    loading: () => <ProfileSkeleton type="meta" />
  }
);

export default function SchedulesPage() {
  const { can } = usePermissions();

  // Verificar permisos usando las constantes
  const canRead = can.do(
    MODULES_PERMISSIONS.SCHEDULE.READ.module,
    MODULES_PERMISSIONS.SCHEDULE.READ.action
  );
  const canView = can.do(
    MODULES_PERMISSIONS.SCHEDULE.READ_ONE.module,
    MODULES_PERMISSIONS.SCHEDULE.READ_ONE.action
  );
  const canCreate = can.do(
    MODULES_PERMISSIONS.SCHEDULE.CREATE.module,
    MODULES_PERMISSIONS.SCHEDULE.CREATE.action
  );
  const canEdit = can.do(
    MODULES_PERMISSIONS.SCHEDULE.UPDATE.module,
    MODULES_PERMISSIONS.SCHEDULE.UPDATE.action
  );
  const canDelete = can.do(
    MODULES_PERMISSIONS.SCHEDULE.DELETE.module,
    MODULES_PERMISSIONS.SCHEDULE.DELETE.action
  );
  const canConfigure = can.do(
    MODULES_PERMISSIONS.SCHEDULE.CONFIGURE.module,
    MODULES_PERMISSIONS.SCHEDULE.CONFIGURE.action
  );

  // Si no tiene permiso de lectura, mostrar componente de acceso denegado
  if (!canRead) {
    return (
      <NoPermissionCard
        module={MODULES_PERMISSIONS.SCHEDULE.READ.module}
        action={MODULES_PERMISSIONS.SCHEDULE.READ.action}
        title="Acceso Denegado"
        description="No tienes permisos para acceder a la gestión de horarios."
        variant="page"
      />
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        pageTitle="Horarios"
        items={[
          { label: "Inicio", href: "/dashboard" },
          { label: "Gestión Académica", href: "#" },
          { label: "Horarios", href: "#" },
        ]}
      />
      <SchedulesContent
        canView={canView}
        canCreate={canCreate}
        canEdit={canEdit}
        canDelete={canDelete}
        canConfigure={canConfigure}
      />
    </div>
  );
}