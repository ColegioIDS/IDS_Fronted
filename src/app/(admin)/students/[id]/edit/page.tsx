// src/app/(admin)/students/[id]/edit/page.tsx
'use client';

import { StudentEditForm } from '@/components/features/students';
import { useRouter } from 'next/navigation';
import { use } from 'react';

interface StudentEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function StudentEditPage({ params }: StudentEditPageProps) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const studentId = parseInt(unwrappedParams.id);

  if (isNaN(studentId)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            ID de estudiante inválido
          </p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <StudentEditForm
      studentId={studentId}
      onSuccess={() => router.push('/(admin)/students/list')}
    />
  );
}
