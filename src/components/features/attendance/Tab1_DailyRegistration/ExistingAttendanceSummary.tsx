/**
 * RESUMEN DE ASISTENCIAS YA REGISTRADAS
 * Muestra cuáles estudiantes ya tienen asistencia registrada
 */

'use client';

import { AttendanceStatus, ConsolidatedAttendanceView } from '@/types/attendance.types';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface ExistingAttendanceSummaryProps {
  existingAttendance: Map<number, { statusId: number; isEarlyExit: boolean }>;
  allowedStatuses?: AttendanceStatus[];
  consolidatedData?: ConsolidatedAttendanceView;
}

export function ExistingAttendanceSummary({
  existingAttendance,
  allowedStatuses = [],
  consolidatedData,
}: ExistingAttendanceSummaryProps) {
  // Si tenemos datos consolidados, usarlos como fuente de verdad
  // para recalcular el resumen (esto se actualiza en tiempo real)
  let attendanceToUse = existingAttendance;
  
  if (consolidatedData && consolidatedData.students.length > 0) {
    const updatedAttendance = new Map<number, { statusId: number; isEarlyExit: boolean }>();
    
    consolidatedData.students.forEach(student => {
      if (student.courses.length > 0) {
        const firstCourse = student.courses[0];
        const allowedStatus = allowedStatuses.find(s => s.code === firstCourse.currentStatus);
        
        updatedAttendance.set(student.enrollmentId, {
          statusId: allowedStatus?.id || 0,
          isEarlyExit: false,
        });
      }
    });
    
    attendanceToUse = updatedAttendance;
  }

  if (attendanceToUse.size === 0) {
    return null;
  }

  // Agrupar por estado
  const attendanceByStatus = new Map<number, Array<{ enrollmentId: number }>>();
  
  attendanceToUse.forEach((record, enrollmentId) => {
    const statusId = record.statusId;
    if (!attendanceByStatus.has(statusId)) {
      attendanceByStatus.set(statusId, []);
    }
    attendanceByStatus.get(statusId)!.push({ enrollmentId });
  });

  return (
    <div className="animate-in fade-in-50 slide-in-from-top-5 rounded-xl border-2 border-emerald-500 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 p-6 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-600 dark:bg-emerald-500 text-white shadow-md">
          <CheckCircle className="h-6 w-6" />
        </div>
        <div>
          <h4 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
            Asistencias Ya Registradas
          </h4>
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="h-3.5 w-3.5 inline mr-1" />
            {existingAttendance.size} estudiante{existingAttendance.size !== 1 ? 's' : ''} con registro previo
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from(attendanceByStatus.entries()).map(([statusId, records]) => {
          const status = allowedStatuses.find(s => s.id === statusId);
          const statusName = status?.name || `Estado #${statusId}`;
          const statusColor = status?.colorCode || '#808080';

          return (
            <div
              key={statusId}
              className="group rounded-xl border-2 bg-white dark:bg-slate-800 p-4 shadow-md transition-all hover:shadow-lg dark:border-opacity-70"
              style={{ borderColor: statusColor }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg shadow-md"
                  style={{ backgroundColor: statusColor }}
                >
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">{records.length}</p>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{statusName}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-100 p-3 dark:border-emerald-700 dark:bg-emerald-900/50">
        <Clock className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
        <span className="text-xs font-medium text-emerald-800 dark:text-emerald-200">
          Estos registros aparecen pre-cargados en la tabla. Puedes modificarlos si es necesario.
        </span>
      </div>
    </div>
  );
}
