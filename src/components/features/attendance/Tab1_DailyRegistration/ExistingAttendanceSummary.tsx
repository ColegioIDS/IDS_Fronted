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
    <div className="rounded-lg border border-green-200 bg-green-50 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-green-600" />
        <h4 className="font-semibold text-green-900">
          Asistencias Ya Registradas ({existingAttendance.size})
        </h4>
      </div>

      <div className="space-y-2">
        {Array.from(attendanceByStatus.entries()).map(([statusId, records]) => {
          const status = allowedStatuses.find(s => s.id === statusId);
          const statusName = status?.name || `Estado #${statusId}`;
          const statusColor = status?.colorCode || '#808080';

          return (
            <div key={statusId} className="flex items-center gap-2 text-sm">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: statusColor }}
              />
              <span className="text-green-900">
                <span className="font-medium">{records.length}</span> estudiante(s) - {statusName}
              </span>
            </div>
          );
        })}
      </div>

      <div className="pt-2 border-t border-green-200 text-xs text-green-700 flex items-center gap-1">
        <Clock className="h-3 w-3" />
        <span>Estos registros aparecen pre-cargados en la tabla arriba</span>
      </div>
    </div>
  );
}
