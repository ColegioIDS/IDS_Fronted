// src/components/features/academic-weeks/AcademicWeekCard.tsx

'use client';

import React from 'react';
import { Calendar, Clock, Edit2, Trash2, Eye, CheckCircle2, XCircle, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { parseISODateForTimezone, formatDateWithTimezone } from '@/utils/dateUtils';
import { AcademicWeek, WEEK_TYPE_LABELS } from '@/types/academic-week.types';
import { getWeekTypeTheme } from '@/config/theme.config';
import { cn } from '@/lib/utils';

interface AcademicWeekCardProps {
  week: AcademicWeek;
  onView?: (week: AcademicWeek) => void;
  onEdit?: (week: AcademicWeek) => void;
  onDelete?: (week: AcademicWeek) => void;
  canView?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

/**
 * 🗓️ Tarjeta individual de Semana Académica
 * 
 * Muestra:
 * - Información de la semana
 * - Tipo con colores temáticos
 * - Fechas de inicio y fin
 * - Estado (activo/inactivo)
 * - Acciones (ver, editar, eliminar)
 */
export function AcademicWeekCard({
  week,
  onView,
  onEdit,
  onDelete,
  canView = false,
  canEdit = false,
  canDelete = false,
}: AcademicWeekCardProps) {
  const theme = getWeekTypeTheme(week.weekType);

  // Verificar si la semana está en progreso
  const now = new Date();
  const start = parseISODateForTimezone(week.startDate);
  const end = parseISODateForTimezone(week.endDate);
  const isInProgress = now >= start && now <= end;

  return (
    <Card
      className={cn(
        'group overflow-hidden transition-all duration-300 border-0 shadow-sm hover:shadow-lg hover:-translate-y-1',
        week.isActive
          ? 'bg-white dark:bg-gray-900'
          : 'bg-slate-50 dark:bg-slate-900',
      )}
    >
      {/* Barra de color superior */}
      <div className={cn('h-1.5 w-full', theme.border)} />
      
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {/* Badge tipo */}
              <span
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-bold text-white',
                  theme.badge,
                )}
              >
                {WEEK_TYPE_LABELS[week.weekType]}
              </span>
              {/* Badge estado */}
              {week.isActive ? (
                <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Activa
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <XCircle className="h-3.5 w-3.5" />
                  Inactiva
                </span>
              )}
            </div>

            {/* Título generado */}
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
              Semana {week.number}
            </h3>

            {/* Año */}
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Año {week.year || formatDateWithTimezone(start, 'yyyy')}
            </p>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {canView && onView && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView(week)}
                className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Ver detalles"
              >
                <Eye className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </Button>
            )}
            {canEdit && onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(week)}
                className="h-8 w-8 p-0 hover:bg-sky-100 dark:hover:bg-sky-900/30 hover:text-sky-600 dark:hover:text-sky-400"
                title="Editar"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
            {canDelete && onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(week)}
                className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
                title="Eliminar"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Detalles */}
        <div className="space-y-3 mt-4">
          {/* Fechas */}
          <div className="p-3 rounded-lg bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-sky-100 dark:bg-sky-900/40">
                <Calendar className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              </div>
              <span className="text-sm font-semibold text-sky-900 dark:text-sky-100">Período</span>
            </div>
            <div className="text-sm text-sky-800 dark:text-sky-200 space-y-1 ml-9">
              <p>
                <span className="font-medium">Inicio:</span> {formatDateWithTimezone(start, 'PPP')}
              </p>
              <p>
                <span className="font-medium">Fin:</span> {formatDateWithTimezone(end, 'PPP')}
              </p>
              <p className="text-xs pt-1">
                <span className="font-medium">{Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))} días</span>
                {isInProgress && (
                  <span className="ml-2 text-sky-600 dark:text-sky-400 font-semibold">
                    • Día {Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Objetivos (si existen) */}
          {week.objectives && (
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/40">
                  <FileText className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-sm font-semibold text-amber-900 dark:text-amber-100">Objetivo</span>
              </div>
              <p className="text-sm text-amber-800 dark:text-amber-200 line-clamp-3 ml-9">
                {week.objectives}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default AcademicWeekCard;
