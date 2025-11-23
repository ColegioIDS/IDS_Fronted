/**
 * RESUMEN DE ASISTENCIAS YA REGISTRADAS
 * Muestra cuáles estudiantes ya tienen asistencia registrada
 */

'use client';

import { AttendanceStatus, ConsolidatedAttendanceView } from '@/types/attendance.types';
import { CheckCircle2, Clock } from 'lucide-react';

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
    <div className="animate-in fade-in-50 slide-in-from-top-5 rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6 shadow-lg dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-cyan-950/20 dark:border-emerald-800">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 p-3 shadow-lg">
          <CheckCircle2 className="h-6 w-6 text-white" />
        </div>
        <div>
          <h4 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
            ✅ Asistencias Ya Registradas
          </h4>
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
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
              className="group relative overflow-hidden rounded-xl border-2 bg-white p-4 shadow-md transition-all hover:scale-105 hover:shadow-xl dark:bg-slate-900"
              style={{ borderColor: statusColor + '40' }}
            >
              <div className="absolute inset-0 opacity-5" style={{ backgroundColor: statusColor }} />
              <div className="relative flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-full shadow-lg ring-2 ring-white dark:ring-slate-800"
                  style={{ backgroundColor: statusColor }}
                />
                <div>
                  <p className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">{records.length}</p>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{statusName}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-100 p-3 dark:bg-emerald-900/30">
        <Clock className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
        <span className="text-xs font-medium text-emerald-800 dark:text-emerald-200">
          Estos registros aparecen pre-cargados en la tabla. Puedes modificarlos si es necesario.
        </span>
      </div>
    </div>
  );
}
