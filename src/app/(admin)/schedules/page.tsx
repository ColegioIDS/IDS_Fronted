'use client';
import dynamic from 'next/dynamic';
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';
import Breadcrumb from '@/components/common/Breadcrumb';

const SchedulesContent = dynamic(() => import('@/components/schedules/ContentSchedules'), {
  loading: () => <ProfileSkeleton type="meta" />
});

export default function SchedulePage() {
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