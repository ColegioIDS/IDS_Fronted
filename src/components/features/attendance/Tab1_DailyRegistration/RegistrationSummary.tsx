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
    <div className="space-y-5 rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 shadow-lg dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 dark:border-blue-800">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-3 shadow-lg">
          <BarChart3 className="h-6 w-6 text-white" />
        </div>
        <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">📊 Resumen de Asistencia</h4>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-5 text-center shadow-lg transition-all hover:scale-105 hover:shadow-xl">
          <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
          <p className="relative text-xs font-medium text-blue-100">Total Estudiantes</p>
          <p className="relative text-3xl font-extrabold text-white">{totalStudents}</p>
          <div className="relative text-2xl">👥</div>
        </div>
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 p-5 text-center shadow-lg transition-all hover:scale-105 hover:shadow-xl">
          <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
          <p className="relative text-xs font-medium text-emerald-100">Registrados</p>
          <p className="relative text-3xl font-extrabold text-white">{registeredStudents}</p>
          <div className="relative text-2xl">✅</div>
        </div>
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-5 text-center shadow-lg transition-all hover:scale-105 hover:shadow-xl">
          <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
          <p className="relative text-xs font-medium text-amber-100">Pendientes</p>
          <p className="relative text-3xl font-extrabold text-white">{unregistered}</p>
          <div className="relative text-2xl">⏳</div>
        </div>

        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 p-5 text-center shadow-lg transition-all hover:scale-105 hover:shadow-xl">
            <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
            <p className="relative text-xs font-medium text-purple-100 uppercase tracking-wide">{status}</p>
            <p className="relative text-3xl font-extrabold text-white">{count}</p>
          </div>
        ))}
      </div>

      {registeredStudents === 0 && (
        <div className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 p-4 dark:from-gray-800 dark:to-gray-900">
          <span className="text-2xl">👉</span>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 italic">
            Selecciona el estado de asistencia para comenzar...
          </p>
        </div>
      )}
    </div>
  );
}
