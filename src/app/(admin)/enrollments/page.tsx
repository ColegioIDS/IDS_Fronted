//src\app\(admin)\enrollments\page.tsx
'use client';
import dynamic from 'next/dynamic';
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';
import Breadcrumb from '@/components/common/Breadcrumb';

const EnrollmentsContent = dynamic(() => import('@/components/enrollments/EnrollmentsContent'), {
  loading: () => <ProfileSkeleton type="meta" />
});

export default function EnrollmentsPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb
        pageTitle="Matrículas"
        items={[
          { label: "Inicio", href: "/dashboard" },
          { label: "Académico", href: "/academic" },
          { label: "Matrículas", href: "#" },
        ]}
      />
     {/*  <EnrollmentsContent /> */}
    </div>
  );
}