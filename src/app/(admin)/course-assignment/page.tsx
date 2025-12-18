// src/app/(admin)/course-assignments/page.tsx
"use client";

import { usePermissions } from '@/hooks/usePermissions';
import { NoPermissionCard } from '@/components/shared/permissions/NoPermissionCard';
import { MODULES_PERMISSIONS } from '@/constants/modules-permissions';
import dynamic from 'next/dynamic';
import Breadcrumb from '@/components/common/Breadcrumb';
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';

const CourseAssignmentsContent = dynamic(
  () => import('@/components/features/course-assignments').then(mod => ({ default: mod.CourseAssignmentsContent })),
  {
    loading: () => <ProfileSkeleton type="meta" />
  }
);

export default function CourseAssignmentsPage() {
  const { can } = usePermissions();

  // Verificar permisos usando las constantes
  const canRead = can.do(
    MODULES_PERMISSIONS.COURSE_ASSIGNMENT.READ.module,
    MODULES_PERMISSIONS.COURSE_ASSIGNMENT.READ.action
  );
  const canView = can.do(
    MODULES_PERMISSIONS.COURSE_ASSIGNMENT.READ_ONE.module,
    MODULES_PERMISSIONS.COURSE_ASSIGNMENT.READ_ONE.action
  );
  const canCreate = can.do(
    MODULES_PERMISSIONS.COURSE_ASSIGNMENT.CREATE.module,
    MODULES_PERMISSIONS.COURSE_ASSIGNMENT.CREATE.action
  );
  const canEdit = can.do(
    MODULES_PERMISSIONS.COURSE_ASSIGNMENT.UPDATE.module,
    MODULES_PERMISSIONS.COURSE_ASSIGNMENT.UPDATE.action
  );
  const canDelete = can.do(
    MODULES_PERMISSIONS.COURSE_ASSIGNMENT.DELETE.module,
    MODULES_PERMISSIONS.COURSE_ASSIGNMENT.DELETE.action
  );

  // Si no tiene permiso de lectura, mostrar componente de acceso denegado
  if (!canRead) {
    return (
      <NoPermissionCard
        module={MODULES_PERMISSIONS.COURSE_ASSIGNMENT.READ.module}
        action={MODULES_PERMISSIONS.COURSE_ASSIGNMENT.READ.action}
        title="Acceso Denegado"
        description="No tienes permisos para acceder a la gestión de asignaciones de cursos."
        variant="page"
      />
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        pageTitle="Asignación de Cursos y Maestros"
        items={[
          { label: "Inicio", href: "/dashboard" },
          { label: "Académico", href: "#" },
          { label: "Asignaciones", href: "#" },
        ]}
      />
      <CourseAssignmentsContent
        canView={canView}
        canCreate={canCreate}
        canEdit={canEdit}
        canDelete={canDelete}
      />
    </div>
  );
}