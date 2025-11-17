'use client';

import React, { useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, Filter } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
    <TooltipProvider>
      <Card className="border-2 border-slate-200 dark:border-slate-800 shadow-md">
        <CardHeader className="border-b-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950/30 border-2 border-indigo-200 dark:border-indigo-800">
              <Filter className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Registro de Asistencia
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                Seleccione fecha, grado y sección para gestionar asistencia
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-5">
            {/* Date Navigation */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousDay}
                      disabled={readOnly}
                      className="border-2"
                      aria-label="Día anterior"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-semibold">Ir al día anterior</p>
                  </TooltipContent>
                </Tooltip>

                <DatePicker
                  selectedDate={selectedDate}
                  onDateChange={onDateChange}
                  disabled={readOnly}
                />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextDay}
                      disabled={readOnly}
                      className="border-2"
                      aria-label="Día siguiente"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-semibold">Ir al día siguiente</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToday}
                    disabled={readOnly}
                    className="gap-2 border-2 bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 border-blue-200 dark:border-blue-800"
                  >
                    <Calendar className="h-4 w-4" />
                    Ir a Hoy
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-semibold">Volver a la fecha actual</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Date Display */}
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 flex-wrap">
                <Calendar className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <span className="font-semibold text-slate-900 dark:text-slate-100 capitalize">
                  {dateFormatted}
                </span>
                {isDateToday(formatDateISO(selectedDate)) && (
                  <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs font-bold rounded-full border-2 border-blue-200 dark:border-blue-800">
                    Hoy
                  </span>
                )}
                {isPast(formatDateISO(selectedDate)) && !isDateToday(formatDateISO(selectedDate)) && (
                  <span className="ml-auto text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Fecha pasada
                  </span>
                )}
                {isFuture(formatDateISO(selectedDate)) && (
                  <span className="ml-auto text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Fecha futura
                  </span>
                )}
              </div>
            </div>

            {/* Grade and Section Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    </TooltipProvider>
  );
}
