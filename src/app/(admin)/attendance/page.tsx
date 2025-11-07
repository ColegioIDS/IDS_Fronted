// src/app/(admin)/attendance/page.tsx

'use client';

import dynamic from 'next/dynamic';
import Breadcrumb from '@/components/common/Breadcrumb';
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';

const AttendanceManagerWrapper = dynamic(
  () => import('@/components/features/attendance/attendance-grid').then(mod => mod.default),
  {
    loading: () => <ProfileSkeleton type="meta" />,
    ssr: false,
  }
);

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <Breadcrumb
        pageTitle="Gestión de Asistencia"
        items={[
          { label: "Inicio", href: "/dashboard" },
          { label: "Académico", href: "#" },
          { label: "Asistencia", href: "#" },
        ]}
      />
      <AttendanceManagerWrapper />
    </div>
  );
}