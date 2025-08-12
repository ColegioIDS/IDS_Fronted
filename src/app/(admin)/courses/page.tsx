'use client';
import dynamic from 'next/dynamic';
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';
import Breadcrumb from '@/components/common/Breadcrumb';

const CoursesContent = dynamic(() => import('@/components/courses/CoursesContent'), {
  loading: () => <ProfileSkeleton type="meta" />
});

export default function CoursesPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb
        pageTitle="Gestión de Cursos"
        items={[
          { label: "Inicio", href: "/dashboard" },
          { label: "Administración", href: "#" },
          { label: "Cursos", href: "#" },
        ]}
      />
      <CoursesContent />
    </div>
  );
}