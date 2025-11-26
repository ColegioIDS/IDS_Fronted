// src/app/(admin)/courses/page.tsx
import dynamic from 'next/dynamic';
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';
import Breadcrumb from '@/components/common/Breadcrumb';
import { ProtectedPage } from '@/components/shared/permissions/ProtectedPage';

// Importación dinámica del nuevo contenido con estructura de features
const CoursesPageContent = dynamic(
  () => import('@/components/features/courses').then(mod => ({ default: mod.CoursesPageContent })),
  {
    loading: () => <ProfileSkeleton type="meta" />
  }
);

export default function CoursesPage() {
  return (
    <ProtectedPage module="course" action="read">
      <div className="space-y-6">
        <Breadcrumb
          pageTitle="Gestión de Cursos"
          items={[
            { label: "Inicio", href: "/dashboard" },
            { label: "Administración", href: "#" },
            { label: "Cursos", href: "/courses" },
          ]}
        />
        <CoursesPageContent />
      </div>
    </ProtectedPage>
  );
}