'use client';

import { useState } from 'react';
import { updateDailyAttendance } from '@/services/attendance-plant.service';

interface UpdateAttendancePayload {
  newAttendanceStatusId: number;
  notes?: string;
  arrivalTime?: string;
  departureTime?: string;
  minutesLate?: number;
  isEarlyExit?: boolean;
  modificationReason?: string;
}

interface UpdateAttendanceState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
  data: any | null;
}

export function useUpdateAttendance() {
  const [state, setState] = useState<UpdateAttendanceState>({
    isLoading: false,
    error: null,
    success: false,
    data: null,
  });

  const updateAttendance = async (
    attendanceId: number,
    payload: UpdateAttendancePayload,
    document?: File | null
  ): Promise<any | null> => {
    setState({ isLoading: true, error: null, success: false, data: null });

    try {
      const result = await updateDailyAttendance(attendanceId, payload, document || undefined);
      setState({
        isLoading: false,
        error: null,
        success: true,
        data: result,
      });
      return result;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Error al actualizar asistencia';
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
    updateAttendance,
    reset,
  };
}
