/**
 * TODAY SCHEDULE CHECK - TAB 4
 * Valida que haya horarios configurados para HOY en la sección seleccionada
 */

'use client';

import { useEffect, useState } from 'react';
import { useAttendanceContext } from '@/context/AttendanceContext';
import { useAuth } from '@/context/AuthContext';
import { validateSectionSchedulesByDay } from '@/services/attendance.service';
import { getIsoDayOfWeek } from '@/utils/dateUtils';
import { DAY_NAMES, type DayOfWeek } from '@/types/schedules.types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface TodayScheduleCheckProps {
  date: string;
  sectionId?: number;
  isLoading?: boolean;
}

export function TodayScheduleCheck({
  date,
  sectionId,
  isLoading = false,
}: TodayScheduleCheckProps) {
  const { state: attendanceState } = useAttendanceContext();
  const { user } = useAuth();
  const [scheduleData, setScheduleData] = useState<{
    hasSchedules: boolean;
    scheduleCount: number;
    dayName: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    const validate = async () => {
      // Use sectionId from props or context
      const targetSectionId = sectionId || attendanceState.selectedSectionId;
      
      if (!targetSectionId || !date) {
        setScheduleData(null);
        setError(null);
        return;
      }

      setIsValidating(true);
      setError(null);

      try {
        // ✅ Usar función utility que respeta la zona horaria de Guatemala
        const isoDay = getIsoDayOfWeek(date);
        const dayName = DAY_NAMES[isoDay];

        // ✅ NUEVO: Usar endpoint de sección con formato ISO 8601
        const schedules = await validateSectionSchedulesByDay(
          targetSectionId,
          isoDay,
          user?.id
        );

        if (schedules && schedules.length > 0) {
          setScheduleData({
            hasSchedules: true,
            scheduleCount: schedules.length,
            dayName
          });
          setError(null);
        } else {
          setError(`No hay horarios configurados para ${dayName} en esta sección`);
          setScheduleData(null);
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Error al validar horarios de hoy';
        setError(message);
        setScheduleData(null);
      } finally {
        setIsValidating(false);
      }
    };

    validate();
  }, [date, sectionId, attendanceState.selectedSectionId, user?.id]);

  const passed = !error && scheduleData;

  return (
    <Card
      className={`border-2 p-4 transition-all ${
        isValidating
          ? 'border-blue-300 bg-blue-50'
          : passed
            ? 'border-green-300 bg-green-50'
            : 'border-red-300 bg-red-50'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 pt-0.5">
          {isValidating ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-400 border-t-blue-600" />
          ) : passed ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600" />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">
              <Clock className="inline h-4 w-4 mr-1" />
              Horarios para Hoy
            </h3>
            {scheduleData && (
              <span
                className={`ml-auto text-sm font-medium px-2 py-1 rounded ${
                  passed
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {passed ? '✓ Válido' : '✗ Inválido'}
              </span>
            )}
          </div>

          {isValidating ? (
            <p className="text-sm text-blue-700 mt-1">
              Verificando horarios para {scheduleData?.dayName || 'hoy'}...
            </p>
          ) : error ? (
            <Alert className="mt-2 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-900">
                {error}
              </AlertDescription>
            </Alert>
          ) : passed ? (
            <div className="mt-1 space-y-1 text-sm text-gray-700">
              <p>
                ✓ Se encontraron horarios para <strong>{scheduleData.dayName}</strong>
              </p>
              <p className="text-xs text-gray-600">
                Listo para registrar asistencia
              </p>
            </div>
          ) : (
            <p className="text-sm text-red-700 mt-1">
              No se encontraron horarios para esta sección en {scheduleData?.dayName}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
