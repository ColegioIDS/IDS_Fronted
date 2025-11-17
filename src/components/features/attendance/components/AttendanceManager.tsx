'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, BarChart3, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  useAttendance,
  useAttendanceConfig,
  useAttendancePermissions,
  useAttendanceUtils,
} from '@/hooks/attendance-hooks';
import { useGradesAndSections } from '@/hooks/attendance/useGradesAndSections';
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

  // Use grades and sections hook to load sections on demand
  const { sections: loadedSections, fetchSectionsByGrade } = useGradesAndSections();

  // Handle grade change - reset section and load sections for the grade
  const handleGradeChange = useCallback(
    async (gradeId: number | null) => {
      setSelectedGradeId(gradeId);
      setSelectedSectionId(null); // Reset section when grade changes

      // Load sections for the selected grade if gradeId is provided
      if (gradeId) {
        try {
          await fetchSectionsByGrade(gradeId);
        } catch (err) {
          console.error('Error loading sections for grade:', err);
        }
      }
    },
    [fetchSectionsByGrade]
  );

  // Load attendance data using composite hook
  const {
    history = [],
    historyLoading,
    historyError,
  } = useAttendance(enrollmentId ? parseInt(enrollmentId) : 0);

  // Load configuration data  
  const {
    statuses = [],
    grades = [],
    sections = [],
    holidays = [],
    isLoading: configLoading,
    isHoliday: checkIsHoliday,
  } = useAttendanceConfig();

  // Check permissions with current user context
  // Using default params - in real app would come from auth context
  const { canCreate, canUpdate, canDelete } = useAttendancePermissions({
    userRole: 'teacher', // TODO: Get from auth context
    scope: 'GRADE',
  });

  // Load utilities
  const {
    formatDateISO,
    isPast,
    isFuture,
    isToday: isDateToday,
  } = useAttendanceUtils();

  // Handle loading and errors
  const loading = historyLoading || configLoading;
  const error = historyError;

  // Check if today is a holiday
  const isHolidayToday = useMemo(
    () => {
      const dateStr = formatDateISO(selectedDate);
      return holidays.some((h: any) => h.date === dateStr);
    },
    [selectedDate, holidays, formatDateISO]
  );

  if (error) {
    return <ErrorState error={error.message || 'Error loading attendance data'} />;
  }

  if (loading) {
    return <LoadingState />;
  }

  // Extract data array from PaginatedAttendanceResponse
  let historyData: any[] = [];
  if (history && typeof history === 'object' && 'data' in history) {
    historyData = Array.isArray(history.data) ? history.data : [];
  } else if (Array.isArray(history)) {
    historyData = history;
  }

  if (!historyData || historyData.length === 0) {
    return <EmptyState message="No hay registros de asistencia para esta fecha" />;
  }

  // Filter data based on selection
  const filteredData = useMemo(() => {
    return historyData.filter((record: any) => {
      if (selectedGradeId && record.grade?.id !== selectedGradeId) return false;
      if (selectedSectionId && record.section?.id !== selectedSectionId) return false;
      return true;
    });
  }, [historyData, selectedGradeId, selectedSectionId]);

  console.log('[AttendanceManager] loadedSections:', loadedSections);

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
        onGradeChange={handleGradeChange}
        onSectionChange={setSelectedSectionId}
        readOnly={readOnly}
        sections={loadedSections}
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
        <Alert className="bg-blue-50 border-2 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700 shadow-md">
          <Info className="h-5 w-5 text-blue-700 dark:text-blue-300" />
          <AlertDescription className="ml-2">
            <p className="font-semibold text-blue-800 dark:text-blue-200">
              Solo puedes ver los registros. No tienes permisos para modificar asistencia.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Summary */}
      {filteredData.length > 0 && (
        <TooltipProvider>
          <Card className="border-2 border-slate-200 dark:border-slate-800 shadow-md">
            <CardHeader className="border-b-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/30 border-2 border-emerald-200 dark:border-emerald-800">
                  <BarChart3 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Resumen de Asistencia
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-center p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 cursor-help">
                      <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                        {filteredData.length}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">
                        Total Estudiantes
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-semibold">Total de estudiantes registrados</p>
                  </TooltipContent>
                </Tooltip>
                {statuses.slice(0, 3).map((status: any) => {
                  const count = filteredData.filter(
                    (r: any) => r.attendanceStatusId === status.id
                  ).length;
                  return (
                    <Tooltip key={status.id}>
                      <TooltipTrigger asChild>
                        <div className="text-center p-4 rounded-xl bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-800 cursor-help">
                          <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                            {count}
                          </div>
                          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
                            {status.code}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-semibold">
                          {count} {count === 1 ? 'estudiante' : 'estudiantes'} con estado {status.code}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TooltipProvider>
      )}
    </div>
  );
}
