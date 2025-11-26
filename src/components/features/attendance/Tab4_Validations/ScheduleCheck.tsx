/**
 * SCHEDULE CHECK - TAB 4
 * Valida que existan horarios configurados para el maestro en esa fecha
 */

'use client';

import { useEffect, useState } from 'react';
import { validateTeacherSchedules } from '@/services/attendance.service';
import { getIsoDayOfWeek } from '@/utils/dateUtils';
import { DAY_NAMES, type DayOfWeek } from '@/types/schedules.types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface ScheduleCheckProps {
  teacherId: number | null;
  sectionId: number | null;
  date: string;
  isLoading?: boolean;
}

export function ScheduleCheck({
  teacherId,
  sectionId,
  date,
  isLoading = false,
}: ScheduleCheckProps) {
  const [scheduleData, setScheduleData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    const validate = async () => {
      if (!teacherId || !sectionId || !date) {
        setScheduleData(null);
        setError(null);
        return;
      }

      setIsValidating(true);
      setError(null);

      try {
        // ✅ Usar función utility que respeta la zona horaria de Guatemala
        const isoDay = getIsoDayOfWeek(date);

        console.log('📅 ScheduleCheck using timezone-aware date:', { date, isoDay });

        const schedules = await validateTeacherSchedules(
          teacherId,
          isoDay,
          sectionId
        );

        if (schedules && schedules.length > 0) {
          setScheduleData({ count: schedules.length, schedules });
          setError(null);
        } else {
          setScheduleData(null);
          setError('No hay horarios configurados para esta fecha');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al validar horarios';
        setError(message);
        setScheduleData(null);
        console.error('[ScheduleCheck]', message);
      } finally {
        setIsValidating(false);
      }
    };

    validate();
  }, [teacherId, sectionId, date]);

  if (!teacherId || !sectionId || !date) {
    return (
      <Alert className="border-gray-200 bg-gray-50">
        <Clock className="h-4 w-4 text-gray-600" />
        <AlertDescription className="text-gray-900">
          Selecciona maestro, sección y fecha
        </AlertDescription>
      </Alert>
    );
  }

  if (isValidating || isLoading) {
    return (
      <Alert className="border-blue-200 bg-blue-50">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-blue-600" />
          <AlertDescription className="text-blue-900">
            Validando horarios...
          </AlertDescription>
        </div>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-900">
          ❌ {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (scheduleData) {
    const count = (scheduleData.count as number) || 0;
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-900">
          ✅ Horarios configurados: {count} clase{count !== 1 ? 's' : ''} encontrada{count !== 1 ? 's' : ''}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-yellow-200 bg-yellow-50">
      <AlertCircle className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="text-yellow-900">
        ⚠️ No hay horarios para esta fecha
      </AlertDescription>
    </Alert>
  );
}
