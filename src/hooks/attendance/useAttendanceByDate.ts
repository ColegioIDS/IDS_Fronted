'use client';

import { useState, useCallback } from 'react';
import { attendanceRecordService } from '@/services/attendance-record.service';

interface UseAttendanceByDateProps {
  sectionId?: number;
  cycleId?: number;
  gradeId?: number;
  date: Date;
}

interface ClassAttendance {
  id: string;
  scheduleId: string;
  className: string;
  startTime: string;
  endTime: string;
  attendanceStatusId: string;
  status: string;
  arrivalTime?: string | null;
  notes?: string | null;
}

interface AttendanceRecord {
  id: string;
  enrollmentId: string;
  studentId: string;
  studentName: string;
  date: string;
  status: string;
  arrivalTime?: string | null;
  departureTime?: string | null;
  notes?: string | null;
  isEarlyExit?: boolean;
  classAttendances: ClassAttendance[];
}

export const useAttendanceByDate = ({
  sectionId,
  cycleId,
  gradeId,
  date,
}: UseAttendanceByDateProps) => {
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({});
  const [allRecords, setAllRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadAttendance = useCallback(async () => {
    if (!sectionId || !cycleId || !gradeId) {
      console.log('[useAttendanceByDate] Missing sectionId, cycleId or gradeId, skipping load');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
      console.log('[useAttendanceByDate] 📥 Iniciando carga de asistencia:', {
        sectionId,
        cycleId,
        date: dateString,
      });

      let records = [];
      
      try {
        // Intentar cargar registros existentes
        records = await attendanceRecordService.getAttendanceByDate(
          sectionId,
          cycleId,
          dateString
        );
        console.log('[useAttendanceByDate] ✅ Registros cargados exitosamente:', {
          count: records.length,
          records,
        });
      } catch (loadErr: any) {
        // Si 404 (no hay registros), crear nuevos con estado default (Presente = 1)
        if (loadErr?.response?.status === 404 || loadErr?.message?.includes('404')) {
          console.log('[useAttendanceByDate] 📭 No hay registros (404) - Creando nuevos...');
          
          try {
            // Crear registros nuevos con estado Presente (statusId = 1)
            const createdRecords = await attendanceRecordService.bulkCreateAttendance(
              sectionId,
              gradeId,
              dateString,
              1, // Presente
              'Registros de asistencia creados automáticamente'
            );
            
            records = createdRecords || [];
            console.log('[useAttendanceByDate] ✅ Registros creados exitosamente:', {
              count: records.length,
              records,
            });
          } catch (createErr) {
            console.error('[useAttendanceByDate] ❌ Error creando registros:', createErr);
            // Si falla la creación, continuar con array vacío
            records = [];
          }
        } else {
          // Si es otro error, lanzarlo
          throw loadErr;
        }
      }

      // Map records by enrollmentId for quick lookup
      const attendanceMap: Record<string, AttendanceRecord> = {};
      records.forEach((record: AttendanceRecord) => {
        attendanceMap[record.enrollmentId] = record;
      });

      console.log('[useAttendanceByDate] 📊 Mapa de asistencia generado:', {
        mapKeys: Object.keys(attendanceMap),
        mapSize: Object.keys(attendanceMap).length,
        records: records.length,
      });

      setAttendance(attendanceMap);
      setAllRecords(records);
    } catch (err) {
      console.error('[useAttendanceByDate] ❌ Error cargando asistencia:', err);
      setError(err instanceof Error ? err : new Error('Error loading attendance'));
      setAttendance({});
    } finally {
      setLoading(false);
    }
  }, [sectionId, cycleId, gradeId, date]);

  return {
    attendance,
    allRecords,
    loading,
    error,
    loadAttendance,
  };
};
