// src/app/(admin)/students/[id]/edit/page.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { MODULES_PERMISSIONS } from '@/constants/modules-permissions';
import { ProtectedPage } from '@/components/shared/permissions/ProtectedPage';
import { StudentEditForm } from '@/components/features/students';
import { use } from 'react';

interface StudentEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function StudentEditPage({ params }: StudentEditPageProps) {
  const { hasPermission } = useAuth();
  const unwrappedParams = use(params);
  const studentId = parseInt(unwrappedParams.id);

  const canUpdate = hasPermission(MODULES_PERMISSIONS.STUDENT.UPDATE.module, MODULES_PERMISSIONS.STUDENT.UPDATE.action);

  if (isNaN(studentId)) {
    return (
      <ProtectedPage module={MODULES_PERMISSIONS.STUDENT.UPDATE.module} action={MODULES_PERMISSIONS.STUDENT.UPDATE.action}>
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              ID de estudiante inválido
            </p>
            <button
              onClick={() => window.history.back()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Volver
            </button>
          </div>
        </div>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage module={MODULES_PERMISSIONS.STUDENT.UPDATE.module} action={MODULES_PERMISSIONS.STUDENT.UPDATE.action}>
      <StudentEditForm studentId={studentId} />
    </ProtectedPage>
  );
}
