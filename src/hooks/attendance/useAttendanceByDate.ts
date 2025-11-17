'use client';

import { useState, useCallback } from 'react';
import { attendanceRecordService } from '@/services/attendance-record.service';

interface UseAttendanceByDateProps {
  sectionId?: number;
  cycleId?: number;
  date: Date;
}

interface AttendanceRecord {
  id: number;
  enrollmentId: number;
  attendanceStatusId: number;
  [key: string]: any;
}

export const useAttendanceByDate = ({
  sectionId,
  cycleId,
  date,
}: UseAttendanceByDateProps) => {
  const [attendance, setAttendance] = useState<Record<number, AttendanceRecord>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadAttendance = useCallback(async () => {
    if (!sectionId || !cycleId) {
      console.log('[useAttendanceByDate] Missing sectionId or cycleId, skipping load');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
      console.log('[useAttendanceByDate] Loading attendance:', {
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
        console.log('[useAttendanceByDate] Records loaded:', records);
      } catch (loadErr: any) {
        // Si 404 (no hay registros), crear nuevos con estado default (Presente = 1)
        if (loadErr?.response?.status === 404 || loadErr?.message?.includes('404')) {
          console.log('[useAttendanceByDate] No records found (404), creating new attendance records');
          
          try {
            // Crear registros nuevos con estado Presente (statusId = 1)
            const createdRecords = await attendanceRecordService.bulkCreateAttendance(
              sectionId,
              dateString,
              1, // Presente
              'Registros de asistencia creados automáticamente'
            );
            
            records = createdRecords || [];
            console.log('[useAttendanceByDate] New records created:', records);
          } catch (createErr) {
            console.error('[useAttendanceByDate] Error creating attendance records:', createErr);
            // Si falla la creación, continuar con array vacío
            records = [];
          }
        } else {
          // Si es otro error, lanzarlo
          throw loadErr;
        }
      }

      // Map records by enrollmentId for quick lookup
      const attendanceMap: Record<number, AttendanceRecord> = {};
      records.forEach((record: AttendanceRecord) => {
        attendanceMap[record.enrollmentId] = record;
      });

      setAttendance(attendanceMap);
    } catch (err) {
      console.error('[useAttendanceByDate] Error loading attendance:', err);
      setError(err instanceof Error ? err : new Error('Error loading attendance'));
      setAttendance({});
    } finally {
      setLoading(false);
    }
  }, [sectionId, cycleId, date]);

  return {
    attendance,
    loading,
    error,
    loadAttendance,
  };
};
