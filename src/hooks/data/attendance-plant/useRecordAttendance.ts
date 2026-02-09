'use client';

/**
 * Hook para registrar asistencia con manejo de estados
 */

import { useState } from 'react';
import { recordDailyAttendance } from '@/services/attendance-plant.service';
import type { RecordDailyAttendancePayload, AttendanceRecordResponse } from '@/types/attendance-plant.types';

interface RecordAttendanceState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
  data: AttendanceRecordResponse | null;
}

interface UseRecordAttendanceReturn extends RecordAttendanceState {
  recordAttendance: (payload: RecordDailyAttendancePayload) => Promise<AttendanceRecordResponse | null>;
  reset: () => void;
}

export function useRecordAttendance(): UseRecordAttendanceReturn {
  const [state, setState] = useState<RecordAttendanceState>({
    isLoading: false,
    error: null,
    success: false,
    data: null,
  });

  const recordAttendance = async (
    payload: RecordDailyAttendancePayload
  ): Promise<AttendanceRecordResponse | null> => {
    setState({ isLoading: true, error: null, success: false, data: null });

    try {
      const result = await recordDailyAttendance(payload);
      setState({
        isLoading: false,
        error: null,
        success: true,
        data: result,
      });
      return result;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Error al registrar asistencia';
      const errorCode = err?.response?.data?.errorCode;
      
      setState({
        isLoading: false,
        error: `${errorCode ? `[${errorCode}] ` : ''}${errorMessage}`,
        success: false,
        data: null,
      });
      return null;
    }
  };

  const reset = () => {
    setState({
      isLoading: false,
      error: null,
      success: false,
      data: null,
    });
  };

  return {
    ...state,
    recordAttendance,
    reset,
  };
}
