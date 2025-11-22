/**
 * RESUMEN DE REGISTRO DE ASISTENCIA
 * Muestra estadísticas de asistencia marcada
 */

'use client';

import { BarChart3 } from 'lucide-react';

interface RegistrationSummaryProps {
  totalStudents: number;
  registeredStudents: number;
  statuses: string[];
}

export function RegistrationSummary({
  totalStudents,
  registeredStudents,
  statuses,
}: RegistrationSummaryProps) {
  const statusCounts = statuses.reduce(
    (acc, status) => {
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const unregistered = totalStudents - registeredStudents;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-blue-600" />
        <h4 className="font-semibold text-gray-900">Resumen de Asistencia</h4>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        <div className="rounded bg-blue-50 p-3 text-center">
          <p className="text-sm text-gray-600">Total Estudiantes</p>
          <p className="text-2xl font-bold text-blue-600">{totalStudents}</p>
        </div>
        <div className="rounded bg-green-50 p-3 text-center">
          <p className="text-sm text-gray-600">Registrados</p>
          <p className="text-2xl font-bold text-green-600">{registeredStudents}</p>
        </div>
        <div className="rounded bg-red-50 p-3 text-center">
          <p className="text-sm text-gray-600">Pendientes</p>
          <p className="text-2xl font-bold text-red-600">{unregistered}</p>
        </div>

        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} className="rounded bg-gray-50 p-3 text-center">
            <p className="text-xs text-gray-600">{status}</p>
            <p className="text-2xl font-bold text-gray-900">{count}</p>
          </div>
        ))}
      </div>

      {registeredStudents === 0 && (
        <p className="text-sm text-gray-500 italic">
          Selecciona el estado de asistencia para comenzar...
        </p>
      )}
    </div>
  );
}
