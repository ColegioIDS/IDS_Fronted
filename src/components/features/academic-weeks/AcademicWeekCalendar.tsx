// src/components/features/academic-weeks/AcademicWeekCalendar.tsx

'use client';

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isWithinInterval,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { AcademicWeek, WEEK_TYPE_LABELS } from '@/types/academic-week.types';
import { getWeekTypeTheme } from '@/config/theme.config';
import { cn } from '@/lib/utils';

interface AcademicWeekCalendarProps {
  weeks: AcademicWeek[];
  isLoading?: boolean;
  onWeekClick?: (week: AcademicWeek) => void;
  initialMonth?: Date;
}

/**
 * 📅 Vista de Calendario mensual para Academic Weeks
 * 
 * Muestra un calendario mensual con las semanas académicas superpuestas
 */
export function AcademicWeekCalendar({
  weeks,
  isLoading = false,
  onWeekClick,
  initialMonth = new Date(),
}: AcademicWeekCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(initialMonth);

  // Obtener días del mes actual
  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart, { locale: es });
    const endDate = endOfWeek(monthEnd, { locale: es });

    const days: Date[] = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  }, [currentMonth]);

  // Agrupar días por semanas
  const calendarWeeks = useMemo(() => {
    const weeksArray: Date[][] = [];
    for (let i = 0; i < monthDays.length; i += 7) {
      weeksArray.push(monthDays.slice(i, i + 7));
    }
    return weeksArray;
  }, [monthDays]);

  // Encontrar semanas académicas para cada día
  const getWeeksForDay = (day: Date): AcademicWeek[] => {
    return weeks.filter((week) => {
      const start = new Date(week.startDate);
      const end = new Date(week.endDate);
      return isWithinInterval(day, { start, end });
    });
  };

  // Handlers
  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handleToday = () => setCurrentMonth(new Date());

  if (isLoading) {
    return (
      <div className="h-[600px] bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />
    );
  }

  const today = new Date();

  return (
    <Card className="bg-white dark:bg-gray-900">
      <div className="p-6">
        {/* Header con navegación */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {weeks.length} semana{weeks.length !== 1 ? 's' : ''} académica{weeks.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleToday}>
              Hoy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevMonth}
              className="p-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextMonth}
              className="p-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendario */}
        <div className="space-y-2">
          {calendarWeeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-2">
              {week.map((day, dayIndex) => {
                const weeksForDay = getWeeksForDay(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isToday = isSameDay(day, today);

                return (
                  <div
                    key={dayIndex}
                    className={cn(
                      'min-h-[100px] p-2 rounded-lg border transition-all',
                      isCurrentMonth
                        ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-800',
                      isToday && 'ring-2 ring-indigo-500 dark:ring-indigo-400',
                    )}
                  >
                    {/* Número del día */}
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={cn(
                          'text-sm font-medium',
                          isCurrentMonth
                            ? 'text-gray-900 dark:text-gray-100'
                            : 'text-gray-400 dark:text-gray-600',
                          isToday &&
                            'flex items-center justify-center w-6 h-6 bg-indigo-600 text-white rounded-full',
                        )}
                      >
                        {format(day, 'd')}
                      </span>
                    </div>

                    {/* Semanas académicas */}
                    {weeksForDay.length > 0 && (
                      <div className="space-y-1">
                        {weeksForDay.slice(0, 2).map((week) => {
                          const theme = getWeekTypeTheme(week.weekType);
                          const start = new Date(week.startDate);
                          const isStartDay = isSameDay(day, start);

                          return (
                            <button
                              key={week.id}
                              onClick={() => onWeekClick?.(week)}
                              className={cn(
                                'w-full text-left px-1.5 py-1 rounded text-xs font-medium transition-all',
                                theme.bg,
                                theme.text,
                                'hover:opacity-80 hover:shadow-sm',
                                isStartDay && 'ring-1 ring-offset-1',
                              )}
                              title={`Semana ${week.number} - ${WEEK_TYPE_LABELS[week.weekType]}`}
                            >
                              <div className="truncate">
                                {isStartDay && (
                                  <span className="font-semibold">#{week.number} </span>
                                )}
                                {WEEK_TYPE_LABELS[week.weekType]}
                              </div>
                            </button>
                          );
                        })}

                        {/* Indicador de más semanas */}
                        {weeksForDay.length > 2 && (
                          <div className="text-xs text-center text-gray-500 dark:text-gray-400 py-0.5">
                            +{weeksForDay.length - 2} más
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Leyenda de tipos */}
        <div className="flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Tipos:
          </span>
          {Object.entries(WEEK_TYPE_LABELS).map(([key, label]) => {
            const theme = getWeekTypeTheme(key as any);
            return (
              <div key={key} className="flex items-center gap-2">
                <div className={cn('w-3 h-3 rounded', theme.bg)} />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Estadísticas del mes */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {weeks.length}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Semanas totales
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {weeks.filter((w) => w.isActive).length}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Activas
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {weeks.filter((w) => {
                const start = new Date(w.startDate);
                const end = new Date(w.endDate);
                return isWithinInterval(today, { start, end });
              }).length}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              En curso
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default AcademicWeekCalendar;
