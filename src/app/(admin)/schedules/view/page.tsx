'use client';

import { usePermissions } from '@/hooks/usePermissions';
import { NoPermissionCard } from '@/components/shared/permissions/NoPermissionCard';
import { MODULES_PERMISSIONS } from '@/constants/modules-permissions';
import dynamic from 'next/dynamic';
import Breadcrumb from '@/components/common/Breadcrumb';
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';

const SchedulesViewContent = dynamic(
  () => import('@/components/features/schedules').then(mod => ({ default: mod.SchedulesViewContent })),
  {
    loading: () => <ProfileSkeleton type="meta" />
  }
);

export default function SchedulesViewPage() {
  const { can } = usePermissions();

  // Verificar permisos usando las constantes
  const canRead = can.do(
    MODULES_PERMISSIONS.SCHEDULE.READ.module,
    MODULES_PERMISSIONS.SCHEDULE.READ.action
  );

  // Si no tiene permiso de lectura, mostrar componente de acceso denegado
  if (!canRead) {
    return (
      <NoPermissionCard
        module={MODULES_PERMISSIONS.SCHEDULE.READ.module}
        action={MODULES_PERMISSIONS.SCHEDULE.READ.action}
        title="Acceso Denegado"
        description="No tienes permisos para ver los horarios."
        variant="page"
      />
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        pageTitle="Ver Horarios"
        items={[
          { label: "Inicio", href: "/dashboard" },
          { label: "Gestión Académica", href: "#" },
          { label: "Horarios", href: "/admin/schedules" },
          { label: "Ver Horarios", href: "#" },
        ]}
      />
      <SchedulesViewContent />
    </div>
  );
}
