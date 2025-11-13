'use client';

import React, { useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import {
  useAttendanceConfig,
  useAttendanceUtils,
} from '@/hooks/attendance-hooks';
import DatePicker from './DatePicker';
import GradeSelector from './GradeSelector';
import SectionSelector from './SectionSelector';

interface AttendanceHeaderProps {
  selectedDate: Date;
  selectedGradeId: number | null;
  selectedSectionId: number | null;
  onDateChange: (date: Date) => void;
  onGradeChange: (gradeId: number | null) => void;
  onSectionChange: (sectionId: number | null) => void;
  readOnly?: boolean;
}

/**
 * AttendanceHeader Component
 * Contains date picker, grade/section selectors, and stats
 */
export default function AttendanceHeader({
  selectedDate,
  selectedGradeId,
  selectedSectionId,
  onDateChange,
  onGradeChange,
  onSectionChange,
  readOnly = false,
}: AttendanceHeaderProps) {
  const {
    grades = [],
    sections = [],
    isLoading: configLoading,
  } = useAttendanceConfig();

  const {
    formatDateISO,
    isToday: isDateToday,
    isPast,
    isFuture,
  } = useAttendanceUtils();

  const handlePreviousDay = useCallback(() => {
    const previous = new Date(selectedDate);
    previous.setDate(previous.getDate() - 1);
    onDateChange(previous);
  }, [selectedDate, onDateChange]);

  const handleNextDay = useCallback(() => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    onDateChange(next);
  }, [selectedDate, onDateChange]);

  const handleToday = useCallback(() => {
    onDateChange(new Date());
  }, [onDateChange]);

  const dateFormatted = selectedDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Registro de Asistencia</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Date Navigation */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousDay}
              disabled={readOnly}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <DatePicker
              selectedDate={selectedDate}
              onDateChange={onDateChange}
              disabled={readOnly}
            />

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextDay}
              disabled={readOnly}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleToday}
              disabled={readOnly}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Hoy
            </Button>
          </div>

          {/* Date Display */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium capitalize">{dateFormatted}</span>
            {isDateToday(formatDateISO(selectedDate)) && (
              <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded">
                Hoy
              </span>
            )}
            {isPast(formatDateISO(selectedDate)) && !isDateToday(formatDateISO(selectedDate)) && (
              <span className="ml-2 text-xs text-gray-500">Fecha pasada</span>
            )}
          </div>

          {/* Grade and Section Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <GradeSelector
              selectedGradeId={selectedGradeId}
              onGradeChange={onGradeChange}
              disabled={readOnly || configLoading}
            />

            {selectedGradeId && (
              <SectionSelector
                gradeId={selectedGradeId}
                selectedSectionId={selectedSectionId}
                onSectionChange={onSectionChange}
                disabled={readOnly || configLoading}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
