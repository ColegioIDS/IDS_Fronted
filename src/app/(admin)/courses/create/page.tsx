// src/app/(admin)/courses/create/page.tsx
import dynamic from 'next/dynamic';
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';
import Breadcrumb from '@/components/common/Breadcrumb';
import { ProtectedPage } from '@/components/shared/permissions/ProtectedPage';
import { COURSE_PERMISSIONS } from '@/constants/modules-permissions/course';

const CourseForm = dynamic(
  () => import('@/components/features/courses').then(mod => ({ default: mod.CourseForm })),
  {
    loading: () => <ProfileSkeleton type="meta" />
  }
);

export default function CreateCoursePage() {
  return (
    <ProtectedPage module={COURSE_PERMISSIONS.CREATE.module} action={COURSE_PERMISSIONS.CREATE.action}>
      <div className="space-y-6">
        <Breadcrumb
          pageTitle="Crear Nuevo Curso"
          items={[
            { label: "Inicio", href: "/dashboard" },
            { label: "Administración", href: "#" },
            { label: "Cursos", href: "/courses" },
            { label: "Crear", href: "/courses/create" },
          ]}
        />
        <div className="p-6 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <CourseForm onSuccess={() => {}} onCancel={() => {}} />
        </div>
      </div>
    </ProtectedPage>
  );
}
