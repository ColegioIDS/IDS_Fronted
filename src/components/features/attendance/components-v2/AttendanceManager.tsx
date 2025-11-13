'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import {
  useAttendance,
  useAttendanceConfig,
  useAttendancePermissions,
  useAttendanceUtils,
} from '@/hooks/attendance-hooks';
import AttendanceHeader from './header/AttendanceHeader';
import AttendanceTable from './table/AttendanceTable';
import EmptyState from './states/EmptyState';
import LoadingState from './states/LoadingState';
import ErrorState from './states/ErrorState';
import HolidayNotice from './states/HolidayNotice';

interface AttendanceManagerProps {
  enrollmentId?: string | null;
  initialDate?: Date;
  readOnly?: boolean;
}

/**
 * Main attendance management component - FASE 3
 * Combines header, table, actions and state management
 * Uses all FASE 2 hooks for data fetching, permissions, utilities
 */
export default function AttendanceManager({
  enrollmentId,
  initialDate = new Date(),
  readOnly = false,
}: AttendanceManagerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [selectedGradeId, setSelectedGradeId] = useState<number | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);

  // Load attendance data
  const {
    history,
    historyLoading,
    historyError,
    report,
    reportLoading,
    reportError,
  } = useAttendance(enrollmentId ? parseInt(enrollmentId) : 0);

  const {
    data: history = [],
    isLoading: historyLoading,
    error: historyError,
  } = useAttendanceHistory();

  // Load configuration data
  const {
    statuses,
    grades,
    sections,
    holidays,
    isLoading: configLoading,
  } = useAttendanceConfig();

  // Check permissions
  const { canCreate, canUpdate, canDelete, canUseScope } = useAttendancePermissions();

  // Load utilities
  const { useAttendanceDateUtils } = useAttendanceUtils();
  const { isHoliday, formatDateISO } = useAttendanceDateUtils();

  // Handle loading and errors
  const loading = historyLoading || configLoading;
  const error = historyError;

  const isHolidayToday = useMemo(
    () => isHoliday(selectedDate),
    [selectedDate, isHoliday]
  );

  if (error) {
    return <ErrorState error={error.message || 'Error loading attendance data'} />;
  }

  if (loading) {
    return <LoadingState />;
  }

  if (!history || history.length === 0) {
    return <EmptyState message="No hay registros de asistencia para esta fecha" />;
  }

  // Filter data based on selection
  const filteredData = useMemo(() => {
    return history.filter((record) => {
      if (selectedGradeId && record.grade?.id !== selectedGradeId) return false;
      if (selectedSectionId && record.section?.id !== selectedSectionId) return false;
      return true;
    });
  }, [history, selectedGradeId, selectedSectionId]);

  return (
    <div className="space-y-4 pb-4">
      {/* Holiday Notice */}
      {isHolidayToday && (
        <HolidayNotice date={selectedDate} />
      )}

      {/* Header with date/grade/section selectors */}
      <AttendanceHeader
        selectedDate={selectedDate}
        selectedGradeId={selectedGradeId}
        selectedSectionId={selectedSectionId}
        onDateChange={setSelectedDate}
        onGradeChange={setSelectedGradeId}
        onSectionChange={setSelectedSectionId}
        readOnly={readOnly}
      />

      {/* Main attendance table */}
      {filteredData.length > 0 ? (
        <AttendanceTable
          data={filteredData}
          selectedDate={selectedDate}
          readOnly={readOnly || !canUpdate}
        />
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            No hay registros para los filtros seleccionados
          </CardContent>
        </Card>
      )}

      {/* Permissions Notice */}
      {!canUpdate && (
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700">
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            Solo puedes ver los registros. No tienes permisos para modificar asistencia.
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Summary */}
      {filteredData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Resumen de Asistencia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {filteredData.length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Total Estudiantes</div>
              </div>
              {config?.statuses?.slice(0, 3).map((status) => {
                const count = filteredData.filter(
                  (r) => r.attendanceStatusId === status.id
                ).length;
                return (
                  <div key={status.id} className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {count}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{status.code}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
