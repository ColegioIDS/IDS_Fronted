// src/app/(admin)/schedules/page.tsx
'use client';

import dynamic from 'next/dynamic';
import Breadcrumb from '@/components/common/Breadcrumb';
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';

const SchedulesContent = dynamic(
  () => import('@/components/schedules/ContentSchedules'),
  {
    loading: () => <ProfileSkeleton type="meta" />
  }
);

export default function SchedulesPage() {
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
      <SchedulesContent />
    </div>
  );
}