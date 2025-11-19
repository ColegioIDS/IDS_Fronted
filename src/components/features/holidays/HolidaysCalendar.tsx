// src/components/features/holidays/HolidaysCalendar.tsx

'use client';

import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO, isWithinInterval, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Coffee, Umbrella, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Holiday, BreakWeek } from '@/types/holidays.types';
import { cn } from '@/lib/utils';

interface HolidaysCalendarProps {
  holidays: Holiday[];
  breakWeeks: BreakWeek[];
}

/**
 * 📅 Calendario visual de días festivos y semanas BREAK
 */
export function HolidaysCalendar({ 
  holidays, 
  breakWeeks,
}: HolidaysCalendarProps) {
  
  // Estado para el mes actual
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Funciones de navegación
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  // Mapear holidays por fecha para búsqueda rápida
  const holidaysByDate = useMemo(() => {
    const map = new Map<string, Holiday>();
    holidays.forEach(holiday => {
      const dateKey = format(parseISO(holiday.date), 'yyyy-MM-dd');
      map.set(dateKey, holiday);
    });
    return map;
  }, [holidays]);

  // Función para verificar si una fecha está en una semana BREAK
  const isDateInBreakWeek = (date: Date): BreakWeek | null => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return breakWeeks.find(week => {
      const start = parseISO(week.startDate);
      const end = parseISO(week.endDate);
      return isWithinInterval(date, { start, end });
    }) || null;
  };

  // Obtener el día de la semana del primer día del mes (0 = Domingo)
  const firstDayOfWeek = monthStart.getDay();

  // Días de la semana
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-md">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Calendario de días festivos
            </p>
          </div>
        </div>

        {/* Controles de navegación */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousMonth}
            className="h-9 w-9 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="h-9 px-3 text-xs font-medium"
          >
            Hoy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextMonth}
            className="h-9 w-9 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex items-center justify-center gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-500 dark:border-emerald-600" />
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Recuperable</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-rose-50 dark:bg-rose-950/30 border-2 border-rose-500 dark:border-rose-600" />
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">No recuperable</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-500 dark:border-amber-600" />
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Receso</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="space-y-2">
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-2 mb-3">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-bold text-gray-600 dark:text-gray-400 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: firstDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}

          {/* Month days */}
          {daysInMonth.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const holiday = holidaysByDate.get(dateKey);
            const breakWeek = isDateInBreakWeek(day);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={dateKey}
                className={cn(
                  'group relative aspect-square rounded-lg border-2 transition-all duration-200 cursor-pointer',
                  // Base styles
                  'bg-white dark:bg-gray-900',
                  // Today highlight
                  isToday && 'ring-2 ring-indigo-400 ring-offset-2 dark:ring-offset-gray-900',
                  // Holiday styles (recuperable) - usando theme success colors
                  holiday && holiday.isRecovered && [
                    'bg-emerald-50 dark:bg-emerald-950/30',
                    'border-emerald-500 dark:border-emerald-600',
                    'hover:bg-emerald-100 dark:hover:bg-emerald-950/50',
                    'hover:shadow-lg hover:scale-105',
                  ],
                  // Holiday styles (no recuperable) - usando theme error colors
                  holiday && !holiday.isRecovered && [
                    'bg-rose-50 dark:bg-rose-950/30',
                    'border-rose-500 dark:border-rose-600',
                    'hover:bg-rose-100 dark:hover:bg-rose-950/50',
                    'hover:shadow-lg hover:scale-105',
                  ],
                  // Break week styles - usando theme warning colors (amarillo)
                  !holiday && breakWeek && [
                    'bg-amber-50 dark:bg-amber-950/30',
                    'border-amber-500 dark:border-amber-600',
                    'hover:bg-amber-100 dark:hover:bg-amber-950/50',
                    'hover:shadow-md',
                  ],
                  // Regular day
                  !holiday && !breakWeek && [
                    'border-gray-200 dark:border-gray-700',
                    'hover:border-gray-300 dark:hover:border-gray-600',
                  ]
                )}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                  {/* Day number */}
                  <span
                    className={cn(
                      'text-sm font-bold mb-1',
                      holiday && holiday.isRecovered && 'text-emerald-700 dark:text-emerald-300',
                      holiday && !holiday.isRecovered && 'text-rose-700 dark:text-rose-300',
                      !holiday && breakWeek && 'text-amber-700 dark:text-amber-300',
                      !holiday && !breakWeek && 'text-gray-900 dark:text-gray-100'
                    )}
                  >
                    {format(day, 'd')}
                  </span>

                  {/* Icon */}
                  {holiday && (
                    <Calendar className={cn(
                      'h-3.5 w-3.5',
                      holiday.isRecovered && 'text-emerald-600 dark:text-emerald-400',
                      !holiday.isRecovered && 'text-rose-600 dark:text-rose-400'
                    )} />
                  )}
                  {!holiday && breakWeek && (
                    <Coffee className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  )}
                </div>

                {/* Tooltip on hover */}
                {(holiday || breakWeek) && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 w-48">
                    <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg px-3 py-2 shadow-xl">
                      {holiday && (
                        <>
                          <p className="font-bold mb-1">{holiday.description}</p>
                          <p className="text-gray-300 dark:text-gray-600 flex items-center gap-1">
                            {holiday.isRecovered ? (
                              <><Check className="w-3 h-3" /> Recuperable</>
                            ) : (
                              <><X className="w-3 h-3" /> No recuperable</>
                            )}
                          </p>
                        </>
                      )}
                      {!holiday && breakWeek && (
                        <>
                          <p className="font-bold mb-1">Semana de Receso</p>
                          <p className="text-gray-300 dark:text-gray-600">
                            Semana {breakWeek.number}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer stats */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {holidays.filter(h => h.isRecovered).length}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Días recuperables
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {holidays.filter(h => !h.isRecovered).length}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Días no recuperables
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {breakWeeks.length}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Semanas de receso
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HolidaysCalendar;
