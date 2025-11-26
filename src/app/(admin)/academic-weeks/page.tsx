// src/app/(admin)/academic-weeks/page.tsx

'use client';

import { AcademicWeekPageContent } from '@/components/features/academic-weeks';
import { usePermissions } from '@/hooks/usePermissions';

export default function AcademicWeeksPage() {
  const { can } = usePermissions();

  // Verificar permisos
  const canRead = can.read('academic-week');
  const canCreate = can.create('academic-week');
  const canEdit = can.update('academic-week');
  const canDelete = can.delete('academic-week');
  const canExport = can.do('academic-week', 'export');

  // Si no tiene permiso de lectura, mostrar mensaje
  if (!canRead) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-red-100 dark:bg-red-900 rounded-full">
            <svg
              className="w-8 h-8 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Sin Acceso
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No tienes permisos para acceder a la gestión de semanas académicas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AcademicWeekPageContent
      canCreate={canCreate}
      canEdit={canEdit}
      canDelete={canDelete}
      canExport={canExport}
    />
  );
}