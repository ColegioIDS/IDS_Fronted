/**
 * RESUMEN DE REGISTRO DE ASISTENCIA
 * Muestra estadísticas de asistencia marcada
 */

'use client';

import { BarChart3, Users, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import type { AttendanceStatus } from '@/types/attendance.types';

interface RegistrationSummaryProps {
  totalStudents: number;
  registeredStudents: number;
  statuses: AttendanceStatus[];
  existingCount?: number;
  existingStatuses?: AttendanceStatus[];
}

export function RegistrationSummary({
  totalStudents,
  registeredStudents,
  statuses,
  existingCount = 0,
  existingStatuses = [],
}: RegistrationSummaryProps) {
  // Combinar estados existentes con nuevos
  const allStatuses = [...existingStatuses, ...statuses];
  
  // Agrupar estados por ID y contar ocurrencias
  const statusCounts = allStatuses.reduce(
    (acc, status) => {
      const key = status.id.toString();
      if (!acc[key]) {
        acc[key] = { status, count: 0 };
      }
      acc[key].count += 1;
      return acc;
    },
    {} as Record<string, { status: AttendanceStatus; count: number }>
  );

  // Contar total de registrados (ya existentes + nuevos marcados)
  const totalRegistered = existingCount + registeredStudents;
  const unregistered = totalStudents - totalRegistered;

  return (
    <div className="space-y-5 rounded-xl border-2 border-blue-200 bg-blue-50 p-6 shadow-lg dark:border-blue-800 dark:bg-blue-950/20">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md dark:bg-blue-500">
          <BarChart3 className="h-6 w-6" />
        </div>
        <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">Resumen de Asistencia</h4>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        <div className="group rounded-xl border-2 border-blue-300 bg-white p-5 text-center shadow-md transition-all hover:border-blue-500 hover:shadow-lg dark:border-blue-700 dark:bg-slate-800">
          <Users className="mx-auto mb-2 h-8 w-8 text-blue-600 dark:text-blue-400" />
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Total Estudiantes</p>
          <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{totalStudents}</p>
        </div>
        <div className="group rounded-xl border-2 border-emerald-300 bg-white p-5 text-center shadow-md transition-all hover:border-emerald-500 hover:shadow-lg dark:border-emerald-700 dark:bg-slate-800">
          <CheckCircle className="mx-auto mb-2 h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Registrados</p>
          <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{totalRegistered}</p>
          {existingCount > 0 && registeredStudents > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              ({existingCount} prev + {registeredStudents} nuevos)
            </p>
          )}
        </div>
        <div className="group rounded-xl border-2 border-amber-300 bg-white p-5 text-center shadow-md transition-all hover:border-amber-500 hover:shadow-lg dark:border-amber-700 dark:bg-slate-800">
          <Clock className="mx-auto mb-2 h-8 w-8 text-amber-600 dark:text-amber-400" />
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Pendientes</p>
          <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">{unregistered}</p>
        </div>

        {Object.entries(statusCounts).map(([key, { status, count }]) => (
          <div 
            key={key} 
            className="group rounded-xl border-2 bg-white p-5 text-center shadow-md transition-all hover:shadow-lg dark:bg-slate-800"
            style={{ borderColor: status.colorCode }}
          >
            <div 
              className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: status.colorCode }}
            >
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">{status.name}</p>
            <p className="text-3xl font-extrabold" style={{ color: status.colorCode }}>{count}</p>
          </div>
        ))}
      </div>

      {totalRegistered === 0 && (
        <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
          <AlertCircle className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <p className="text-sm font-medium italic text-gray-600 dark:text-gray-400">
            Selecciona el estado de asistencia para comenzar...
          </p>
        </div>
      )}
    </div>
  );
}
