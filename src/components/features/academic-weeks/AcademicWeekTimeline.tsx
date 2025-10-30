// src/components/features/academic-weeks/AcademicWeekTimeline.tsx

'use client';

import React, { useMemo } from 'react';
import { Calendar, Clock, CheckCircle2, Flag } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, differenceInDays, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { AcademicWeek, WEEK_TYPE_LABELS } from '@/types/academic-week.types';
import { getWeekTypeTheme } from '@/config/theme.config';
import { cn } from '@/lib/utils';

interface TimelineSection {
  bimesterId: number | null;
  bimesterName: string;
  weeks: AcademicWeek[];
}

interface AcademicWeekTimelineProps {
  weeks: AcademicWeek[];
  isLoading?: boolean;
  onWeekClick?: (week: AcademicWeek) => void;
}

/**
 * 📈 Vista Timeline cronológica para Academic Weeks
 * 
 * Muestra una línea de tiempo con semanas agrupadas por bimestre
 */
export function AcademicWeekTimeline({
  weeks,
  isLoading = false,
  onWeekClick,
}: AcademicWeekTimelineProps) {
  // Agrupar semanas por bimestre
  const timelineSections = useMemo(() => {
    const sections = new Map<number | null, TimelineSection>();

    weeks.forEach((week) => {
      const bimesterId = (week as any).bimesterId || null;
      const bimesterName = (week as any).bimester?.name || 'Sin bimestre';

      if (!sections.has(bimesterId)) {
        sections.set(bimesterId, {
          bimesterId,
          bimesterName,
          weeks: [],
        });
      }

      sections.get(bimesterId)!.weeks.push(week);
    });

    // Ordenar semanas dentro de cada sección
    sections.forEach((section) => {
      section.weeks.sort((a, b) => {
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      });
    });

    return Array.from(sections.values());
  }, [weeks]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 animate-pulse rounded" />
            <div className="space-y-3 ml-6">
              {[...Array(4)].map((_, j) => (
                <div
                  key={j}
                  className="h-24 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (weeks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 dark:bg-gray-800 rounded-full">
          <Calendar className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No hay semanas académicas
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          No hay semanas académicas que mostrar en la línea de tiempo.
        </p>
      </div>
    );
  }

  const today = new Date();

  return (
    <div className="space-y-8">
      {timelineSections.map((section, sectionIndex) => (
        <div key={section.bimesterId || `no-bimester-${sectionIndex}`} className="relative">
          {/* Header del bimestre */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full">
              <Flag className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {section.bimesterName}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {section.weeks.length} semana{section.weeks.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Línea vertical */}
          <div className="absolute left-5 top-16 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

          {/* Semanas */}
          <div className="space-y-4 ml-6">
            {section.weeks.map((week, weekIndex) => {
              const theme = getWeekTypeTheme(week.weekType);
              const start = new Date(week.startDate);
              const end = new Date(week.endDate);
              const isInProgress = isWithinInterval(today, { start, end });
              const isPast = end < today;
              const duration = differenceInDays(end, start) + 1;

              return (
                <div key={week.id} className="relative">
                  {/* Punto en la línea */}
                  <div
                    className={cn(
                      'absolute -left-[26px] top-6 w-3 h-3 rounded-full border-2 bg-white dark:bg-gray-900',
                      isPast
                        ? 'border-gray-400 dark:border-gray-600'
                        : isInProgress
                        ? 'border-blue-500 dark:border-blue-400 animate-pulse'
                        : theme.border.replace('border-l-', 'border-'),
                    )}
                  />

                  {/* Card de la semana */}
                  <Card
                    className={cn(
                      'ml-6 transition-all duration-200 border-l-4 cursor-pointer',
                      'hover:shadow-lg hover:-translate-y-0.5',
                      week.isActive
                        ? theme.border
                        : 'border-l-gray-300 dark:border-l-gray-600',
                      isInProgress && 'ring-2 ring-blue-500 dark:ring-blue-400',
                    )}
                    onClick={() => onWeekClick?.(week)}
                  >
                    <div className="p-4">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {/* Badge número */}
                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold rounded">
                              #{week.weekNumber}
                            </span>
                            {/* Badge tipo */}
                            <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', theme.badge)}>
                              {WEEK_TYPE_LABELS[week.weekType]}
                            </span>
                            {/* Badge estado */}
                            {isInProgress && (
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium animate-pulse">
                                <Clock className="h-3 w-3" />
                                En curso
                              </span>
                            )}
                            {isPast && week.isActive && (
                              <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                <CheckCircle2 className="h-3 w-3" />
                                Completada
                              </span>
                            )}
                          </div>

                          {/* Nombre */}
                          <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                            {week.name}
                          </h4>
                        </div>
                      </div>

                      {/* Fechas */}
                      <div className="flex items-center gap-4 text-sm mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className={cn('h-4 w-4', theme.icon)} />
                          <div>
                            <p className="text-gray-700 dark:text-gray-300 font-medium">
                              {format(start, "d 'de' MMMM", { locale: es })}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Inicio</p>
                          </div>
                        </div>

                        <div className="flex-1 flex items-center justify-center">
                          <div className="h-px flex-1 bg-gray-300 dark:bg-gray-600" />
                          <span className="px-3 text-xs text-gray-500 dark:text-gray-400">
                            {duration} días
                          </span>
                          <div className="h-px flex-1 bg-gray-300 dark:bg-gray-600" />
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="text-gray-700 dark:text-gray-300 font-medium">
                              {format(end, "d 'de' MMMM", { locale: es })}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Fin</p>
                          </div>
                          <Calendar className={cn('h-4 w-4', theme.icon)} />
                        </div>
                      </div>

                      {/* Progress bar si está en curso */}
                      {isInProgress && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                            <span>Progreso</span>
                            <span>
                              {Math.ceil(differenceInDays(today, start))} /{' '}
                              {duration} días
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 transition-all duration-300"
                              style={{
                                width: `${(differenceInDays(today, start) / duration) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Notas */}
                      {week.notes && (
                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {week.notes}
                          </p>
                        </div>
                      )}

                      {/* Footer con año y mes */}
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                        <span>📅 {week.year}</span>
                        <span>📆 {format(start, 'MMMM', { locale: es })}</span>
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Resumen final */}
      <div className="flex items-center gap-3 pt-4">
        <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full">
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Final de la línea de tiempo
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Total: {weeks.length} semana{weeks.length !== 1 ? 's' : ''} académica
            {weeks.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  );
}

export default AcademicWeekTimeline;
