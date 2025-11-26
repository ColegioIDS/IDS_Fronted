// src/components/features/academic-weeks/AcademicWeekDetailDialog.tsx

'use client';

import React from 'react';
import { X, Calendar, Clock, CheckCircle2, XCircle, FileText } from 'lucide-react';
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

interface AcademicWeekDetailDialogProps {
  week: AcademicWeek | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 👁️ Diálogo de detalles completos de Semana Académica
 * 
 * Vista de solo lectura con toda la información
 */
export function AcademicWeekDetailDialog({
  week,
  isOpen,
  onClose,
}: AcademicWeekDetailDialogProps) {
  if (!week) return null;

  const theme = getWeekTypeTheme(week.weekType);
  const start = new Date(week.startDate);
  const end = new Date(week.endDate);
  const duration = differenceInDays(end, start) + 1;
  const now = new Date();
  const isInProgress = now >= start && now <= end;
  const isPast = end < now;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">
                Semana {week.number} - {WEEK_TYPE_LABELS[week.weekType]}
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-2">
                {/* Badge tipo */}
                <span className={cn('px-3 py-1 rounded-full text-sm font-medium', theme.badge)}>
                  {WEEK_TYPE_LABELS[week.weekType]}
                </span>
                {/* Badge estado */}
                {week.isActive ? (
                  <span className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4" />
                    Activa
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full text-sm font-medium">
                    <XCircle className="h-4 w-4" />
                    Inactiva
                  </span>
                )}
                {/* Badge en curso */}
                {isInProgress && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium animate-pulse">
                    <Clock className="h-4 w-4" />
                    En curso
                  </span>
                )}
                {/* Badge completada */}
                {isPast && week.isActive && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4" />
                    Completada
                  </span>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Información del Periodo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Calendar className={cn('h-5 w-5', theme.icon)} />
              Periodo
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Fecha inicio */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Fecha de Inicio
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {format(start, "d 'de' MMMM", { locale: es })}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {format(start, 'yyyy', { locale: es })}
                </p>
              </div>

              {/* Duración */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Duración
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {duration} días
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {Math.ceil(duration / 7)} semana{duration > 7 ? 's' : ''}
                </p>
              </div>

              {/* Fecha fin */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Fecha de Fin
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {format(end, "d 'de' MMMM", { locale: es })}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {format(end, 'yyyy', { locale: es })}
                </p>
              </div>
            </div>

            {/* Progreso si está en curso */}
            {isInProgress && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Progreso de la semana
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Día {Math.ceil(differenceInDays(now, start))} de {duration}
                  </p>
                </div>
                <div className="h-3 bg-blue-200 dark:bg-blue-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300"
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              Información Adicional
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Año */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Año Académico
                </p>
                <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {week.year}
                </p>
              </div>

              {/* Mes */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Mes Principal
                </p>
                <p className="text-base font-medium text-gray-900 dark:text-gray-100 capitalize">
                  {format(start, 'MMMM', { locale: es })}
                </p>
              </div>
            </div>
          </div>

          {/* Objetivos */}
          {week.objectives && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Objetivos de Aprendizaje
              </h3>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {week.objectives}
                </p>
              </div>
            </div>
          )}

          {/* Metadatos */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 dark:text-gray-400">
              <div>
                <p className="mb-1">ID de la semana</p>
                <p className="font-mono text-gray-700 dark:text-gray-300">#{week.id}</p>
              </div>
              <div>
                <p className="mb-1">Tipo de semana</p>
                <p className="text-gray-700 dark:text-gray-300">
                  {WEEK_TYPE_LABELS[week.weekType]}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botón cerrar */}
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
          <Button onClick={onClose} variant="outline">
            <X className="h-4 w-4 mr-2" />
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AcademicWeekDetailDialog;
