// src/components/features/academic-weeks/AcademicWeekDetailDialog.tsx

'use client';

import React from 'react';
import { X, Calendar, Clock, CheckCircle2, XCircle, FileText, BookOpen, Hash } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { AcademicWeek, WEEK_TYPE_LABELS } from '@/types/academic-week.types';
import { getWeekTypeTheme } from '@/config/theme.config';
import { cn } from '@/lib/utils';
import { parseISODateForTimezone, formatDateWithTimezone } from '@/utils/dateUtils';

interface AcademicWeekDetailDialogProps {
  week: AcademicWeek | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Diálogo de detalles completos de Semana Académica
 */
export function AcademicWeekDetailDialog({
  week,
  isOpen,
  onClose,
}: AcademicWeekDetailDialogProps) {
  if (!week) return null;

  const theme = getWeekTypeTheme(week.weekType);
  const start = parseISODateForTimezone(week.startDate);
  const end = parseISODateForTimezone(week.endDate);
  const duration = differenceInDays(end, start) + 1;
  const now = new Date();
  const isInProgress = now >= start && now <= end;
  const isPast = end < now;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-3">
                Semana {week.number} - {WEEK_TYPE_LABELS[week.weekType]}
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn('px-3 py-1 rounded-full text-sm font-semibold text-white', theme.badge)}>
                  {WEEK_TYPE_LABELS[week.weekType]}
                </span>
                {week.isActive ? (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4" />
                    Activa
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-sm font-medium">
                    <XCircle className="h-4 w-4" />
                    Inactiva
                  </span>
                )}
                {isInProgress && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 rounded-full text-sm font-semibold animate-pulse">
                    <Clock className="h-4 w-4" />
                    En curso
                  </span>
                )}
                {isPast && week.isActive && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded-full text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4" />
                    Completada
                  </span>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Información del Periodo */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
              <div className={cn('p-2 rounded-lg', theme.badge)}>
                <Calendar className="h-5 w-5 text-white" />
              </div>
              Periodo
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Fecha inicio */}
              <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                  Fecha de Inicio
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {formatDateWithTimezone(start, "d")}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {formatDateWithTimezone(start, "MMMM, yyyy")}
                </p>
              </div>

              {/* Duración */}
              <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-slate-300 dark:hover:border-slate-600 transition-colors bg-gradient-to-br from-slate-50 dark:from-slate-900/50 to-transparent">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                  Duración
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {duration} días
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {Math.ceil(duration / 7)} semana{duration > 7 ? 's' : ''}
                </p>
              </div>

              {/* Fecha fin */}
              <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                  Fecha de Fin
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {formatDateWithTimezone(end, "d")}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {formatDateWithTimezone(end, "MMMM, yyyy")}
                </p>
              </div>
            </div>

            {/* Progreso si está en curso */}
            {isInProgress && (
              <div className="p-4 bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-sky-900 dark:text-sky-100">
                    Progreso de la semana
                  </p>
                  <p className="text-sm font-semibold text-sky-700 dark:text-sky-300">
                    Día {Math.ceil(differenceInDays(now, start))} de {duration}
                  </p>
                </div>
                <div className="h-2 bg-sky-200 dark:bg-sky-900/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-600 dark:bg-sky-500 transition-all duration-300"
                    style={{
                      width: `${(differenceInDays(now, start) / duration) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Información Adicional */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              Información Adicional
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Año */}
              <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                  Año Académico
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {week.year || formatDateWithTimezone(start, 'yyyy')}
                </p>
              </div>

              {/* Mes */}
              <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                  Mes Principal
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100 capitalize">
                  {formatDateWithTimezone(start, 'MMMM')}
                </p>
              </div>
            </div>
          </div>

          {/* Objetivos */}
          {week.objectives && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                Objetivos de Aprendizaje
              </h3>
              <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-gradient-to-br from-slate-50 dark:from-slate-900/30 to-transparent">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {week.objectives}
                </p>
              </div>
            </div>
          )}

          {/* Metadatos */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                  ID de la Semana
                </p>
                <p className="font-mono text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                  <Hash className="h-4 w-4 text-slate-400" />
                  {week.id}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                  Tipo de Semana
                </p>
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {WEEK_TYPE_LABELS[week.weekType]}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botón cerrar */}
        <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700 mt-6">
          <Button 
            onClick={onClose} 
            variant="outline"
            className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4 mr-2" />
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AcademicWeekDetailDialog;
