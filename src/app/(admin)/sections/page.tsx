//src\app\(admin)\bimesters\page.tsx
'use client';
import dynamic from 'next/dynamic';
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';
import Breadcrumb from '@/components/common/Breadcrumb';

const SectionsContent = dynamic(() => import('@/components/sections/SectionsContent'), {
  loading: () => <ProfileSkeleton type="meta" />
});

export default function BimesterPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb
        pageTitle=""
        items={[
          { label: "Inicio", href: "/dashboard" },
          { label: "Ciclos Escolares", href: "/cycles" },
          { label: "Grados", href: "#" },
        ]}
      />
      <SectionsContent />
    </div>
  );
}