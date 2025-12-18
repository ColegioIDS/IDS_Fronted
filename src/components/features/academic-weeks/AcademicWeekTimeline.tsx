// src/components/features/academic-weeks/AcademicWeekTimeline.tsx

'use client';

import React, { useMemo } from 'react';
import { Calendar, Clock, CheckCircle2, Flag, BookOpen, Hash } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, differenceInDays, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { AcademicWeek, WEEK_TYPE_LABELS } from '@/types/academic-week.types';
import { getWeekTypeTheme } from '@/config/theme.config';
import { cn } from '@/lib/utils';
import { parseISODateForTimezone, formatDateWithTimezone } from '@/utils/dateUtils';

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
        return parseISODateForTimezone(a.startDate).getTime() - parseISODateForTimezone(b.startDate).getTime();
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
          <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-indigo-200 dark:border-indigo-800">
            <div className="p-2.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-700">
              <Flag className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100">
                {section.bimesterName}
              </h3>
              <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                {section.weeks.length} semana{section.weeks.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Línea vertical */}
          <div className="absolute left-5 top-16 bottom-0 w-0.5 bg-gradient-to-b from-indigo-300 via-indigo-200 to-indigo-100 dark:from-indigo-700 dark:via-indigo-800 dark:to-indigo-900" />

          {/* Semanas */}
          <div className="space-y-4 ml-6">
            {section.weeks.map((week, weekIndex) => {
              const theme = getWeekTypeTheme(week.weekType);
              const start = parseISODateForTimezone(week.startDate);
              const end = parseISODateForTimezone(week.endDate);
              const isInProgress = isWithinInterval(today, { start, end });
              const isPast = end < today;
              const duration = differenceInDays(end, start) + 1;

              return (
                <div key={week.id} className="relative">
                  {/* Punto en la línea */}
                  <div className="absolute -left-[29px] top-6 flex items-center justify-center">
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                        isPast
                          ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-950'
                          : isInProgress
                          ? 'border-sky-500 dark:border-sky-400 bg-sky-50 dark:bg-sky-950 animate-pulse'
                          : 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-950',
                      )}
                    >
                      <div className={cn('w-2 h-2 rounded-full', isPast ? 'bg-emerald-500' : isInProgress ? 'bg-sky-500' : 'bg-indigo-500')} />
                    </div>
                  </div>

                  {/* Card de la semana */}
                  <Card
                    className={cn(
                      'ml-6 transition-all duration-300 border-0 shadow-sm cursor-pointer overflow-hidden',
                      'hover:shadow-lg hover:-translate-y-1',
                      week.isActive
                        ? 'bg-white dark:bg-slate-900'
                        : 'bg-slate-50 dark:bg-slate-950',
                      isInProgress && 'ring-2 ring-sky-400 dark:ring-sky-500',
                    )}
                    onClick={() => onWeekClick?.(week)}
                  >
                    {/* Top border color */}
                    <div className={cn('h-1 w-full', theme.border)} />
                    <div className="p-5">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {/* Badge número */}
                            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-full">
                              #{week.number}
                            </span>
                            {/* Badge tipo */}
                            <span className={cn('px-3 py-1 rounded-full text-xs font-bold text-white', theme.badge)}>
                              {WEEK_TYPE_LABELS[week.weekType]}
                            </span>
                            {/* Badge estado */}
                            {isInProgress && (
                              <span className="flex items-center gap-1 px-3 py-1 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 rounded-full text-xs font-semibold animate-pulse border border-sky-200 dark:border-sky-700">
                                <Clock className="h-3 w-3" />
                                En curso
                              </span>
                            )}
                            {isPast && week.isActive && (
                              <span className="flex items-center gap-1 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-semibold border border-emerald-200 dark:border-emerald-700">
                                <CheckCircle2 className="h-3 w-3" />
                                Completada
                              </span>
                            )}
                          </div>

                          {/* Título */}
                          <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                            Semana {week.number}
                          </h4>
                        </div>
                      </div>

                      {/* Fechas */}
                      <div className="p-3 rounded-lg bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800 mb-4">
                        <div className="flex items-center gap-3 text-sm">
                          <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-900/40 flex-shrink-0">
                            <Calendar className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-sky-600 dark:text-sky-400 font-medium mb-1">Período</p>
                            <p className="text-sm font-semibold text-sky-900 dark:text-sky-100">
                              {formatDateWithTimezone(start, "d MMM")} - {formatDateWithTimezone(end, "d MMM")}
                            </p>
                            <p className="text-xs text-sky-700 dark:text-sky-300 mt-1">
                              {duration} días
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Progress bar si está en curso */}
                      {isInProgress && (
                        <div className="mb-4 p-3 bg-sky-50 dark:bg-sky-900/20 rounded-lg border border-sky-200 dark:border-sky-700">
                          <div className="flex items-center justify-between text-xs text-sky-700 dark:text-sky-300 font-semibold mb-2">
                            <span>Progreso de la semana</span>
                            <span>
                              {Math.ceil(differenceInDays(today, start))} / {duration} días
                            </span>
                          </div>
                          <div className="h-2 bg-sky-200 dark:bg-sky-900 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-sky-500 transition-all duration-300"
                              style={{
                                width: `${(differenceInDays(today, start) / duration) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Objetivos */}
                      {week.objectives && (
                        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 mb-4">
                          <div className="flex gap-2">
                            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex-shrink-0">
                              <BookOpen className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            </div>
                            <p className="text-xs text-amber-800 dark:text-amber-200 line-clamp-2">
                              {week.objectives}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Footer con año y mes */}
                      <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-700 text-xs">
                        <div className="flex items-center gap-1 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                          <Hash className="w-3 h-3" /> {week.year}
                        </div>
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
      <div className="flex items-center gap-3 pt-6 px-4 py-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700">
        <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
            Línea de tiempo completa
          </p>
          <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
            Total: {weeks.length} semana{weeks.length !== 1 ? 's' : ''} académica{weeks.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  );
}

export default AcademicWeekTimeline;
