// src/components/features/attendance/components/schedules/ScheduleList.tsx

'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Calendar, Clock, User, BookOpen } from 'lucide-react';
import { Schedule } from '@/types/attendance.types';

interface ScheduleListProps {
  schedules: Schedule[];
  selectedScheduleIds: number[];
  onSelectionChange: (scheduleIds: number[]) => void;
  loading?: boolean;
  error?: string | null;
  date?: Date;
}

/**
 * Componente que muestra la lista de horarios del día
 * Permite seleccionar múltiples horarios para marcar asistencia
 */
export function ScheduleList({
  schedules,
  selectedScheduleIds,
  onSelectionChange,
  loading = false,
  error = null,
  date,
}: ScheduleListProps) {
  const toggleSchedule = useCallback(
    (scheduleId: number) => {
      if (selectedScheduleIds.includes(scheduleId)) {
        onSelectionChange(selectedScheduleIds.filter(id => id !== scheduleId));
      } else {
        onSelectionChange([...selectedScheduleIds, scheduleId]);
      }
    },
    [selectedScheduleIds, onSelectionChange]
  );

  const toggleSelectAll = useCallback(() => {
    if (selectedScheduleIds.length === schedules.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(schedules.map(s => s.id));
    }
  }, [selectedScheduleIds, schedules, onSelectionChange]);

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
        <AlertDescription className="text-red-800 dark:text-red-200">
          Error al cargar horarios: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <Card className="border-gray-200 dark:border-gray-700">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Cargando horarios...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (schedules.length === 0) {
    return (
      <Card className="border-gray-200 dark:border-gray-700">
        <CardContent className="pt-6">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay horarios disponibles para este día</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const allSelected = selectedScheduleIds.length === schedules.length;
  const someSelected = selectedScheduleIds.length > 0 && selectedScheduleIds.length < schedules.length;

  const formattedDate = date
    ? new Intl.DateTimeFormat('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date)
    : '';

  return (
    <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span>Horarios del Día</span>
            <span className="inline-flex items-center justify-center bg-blue-600 dark:bg-blue-500 text-white text-xs font-bold rounded-full h-6 w-6">
              {selectedScheduleIds.length}/{schedules.length}
            </span>
          </div>
        </CardTitle>
        {formattedDate && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 capitalize">{formattedDate}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Opción: Seleccionar todos */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <Checkbox
            id="select-all-schedules"
            checked={allSelected}
            onCheckedChange={toggleSelectAll}
            className="h-5 w-5"
          />
          <label
            htmlFor="select-all-schedules"
            className="flex-1 cursor-pointer text-sm font-medium text-gray-900 dark:text-white"
          >
            {allSelected ? 'Deseleccionar todo' : 'Seleccionar todo'}
          </label>
        </div>

        {/* Lista de horarios */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {schedules.map((schedule) => {
            const isSelected = selectedScheduleIds.includes(schedule.id);
            const courseName = schedule.course?.name || 'Sin curso asignado';
            const teacherName = schedule.teacher
              ? `${schedule.teacher.givenNames} ${schedule.teacher.lastNames}`
              : 'Sin maestro';

            return (
              <div
                key={schedule.id}
                className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-500'
                    : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-l-4 border-transparent'
                }`}
                onClick={() => toggleSchedule(schedule.id)}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggleSchedule(schedule.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="h-5 w-5 mt-0.5"
                />

                <div className="flex-1 min-w-0">
                  {/* Encabezado: Horario y Curso */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {schedule.startTime} - {schedule.endTime} {courseName}
                        </p>
                      </div>
                    </div>
                    {schedule.classroom && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 flex-shrink-0">
                        Aula {schedule.classroom}
                      </span>
                    )}
                  </div>

                  {/* Detalles: Maestro */}
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 dark:text-gray-400">
                    <User className="h-3.5 w-3.5" />
                    <span>{teacherName}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Información */}
        <div className="mt-3 p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            📌 {selectedScheduleIds.length === 0
              ? 'Selecciona uno o más horarios para registrar asistencia'
              : `Se registrará asistencia para ${selectedScheduleIds.length} horario(s)`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
