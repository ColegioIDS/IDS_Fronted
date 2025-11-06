'use client';

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
