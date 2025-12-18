// src/app/(admin)/students/create/page.tsx
'use client';

import { MODULES_PERMISSIONS } from '@/constants/modules-permissions';
import { ProtectedPage } from '@/components/shared/permissions/ProtectedPage';
import { StudentCreateForm } from '@/components/features/students/StudentCreateForm';

export default function CreateStudentPage() {
  return (
    <ProtectedPage module={MODULES_PERMISSIONS.STUDENT.CREATE.module} action={MODULES_PERMISSIONS.STUDENT.CREATE.action}>
      <StudentCreateForm />
    </ProtectedPage>
  );
}