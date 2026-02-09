import { useState } from 'react';
import { recordDailyAttendanceBulk } from '@/services/attendance-plant.service';
import type { RecordDailyAttendanceBulkPayload, BulkAttendanceResponse } from '@/types/attendance-plant.types';

export function useRecordAttendanceBulk() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recordBulkAttendance = async (
    payload: RecordDailyAttendanceBulkPayload
  ): Promise<BulkAttendanceResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await recordDailyAttendanceBulk(payload);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al registrar asistencia en bulk';
      setError(errorMessage);
      console.error('[useRecordAttendanceBulk]', errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    recordBulkAttendance,
  };
}
