// src/components/features/academic-weeks/AcademicWeekCard.tsx

'use client';

import React from 'react';
import { Calendar, Clock, Edit2, Trash2, Eye, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AcademicWeek, WEEK_TYPE_LABELS } from '@/types/academic-week.types';
import { getWeekTypeTheme } from '@/config/theme.config';
import { cn } from '@/lib/utils';

interface AcademicWeekCardProps {
  week: AcademicWeek;
  onView?: (week: AcademicWeek) => void;
  onEdit?: (week: AcademicWeek) => void;
  onDelete?: (week: AcademicWeek) => void;
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
  canEdit = false,
  canDelete = false,
}: AcademicWeekCardProps) {
  const theme = getWeekTypeTheme(week.weekType);

  // Verificar si la semana está en progreso
  const now = new Date();
  const start = new Date(week.startDate);
  const end = new Date(week.endDate);
  const isInProgress = now >= start && now <= end;

  return (
    <Card
      className={cn(
        'group hover:shadow-lg transition-all duration-200 border-l-4',
        week.isActive
          ? `${theme.border} bg-white dark:bg-gray-900`
          : 'border-l-gray-300 dark:border-l-gray-600 bg-gray-50 dark:bg-gray-800',
      )}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {/* Badge tipo */}
              <span
                className={cn(
                  'px-2.5 py-0.5 rounded-full text-xs font-medium',
                  theme.badge,
                )}
              >
                {WEEK_TYPE_LABELS[week.weekType]}
              </span>
              {/* Badge estado */}
              {week.isActive ? (
                <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-3 w-3" />
                  Activa
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <XCircle className="h-3 w-3" />
                  Inactiva
                </span>
              )}
              {/* Badge en progreso */}
              {isInProgress && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium animate-pulse">
                  <Clock className="h-3 w-3" />
                  En curso
                </span>
              )}
            </div>

            {/* Nombre */}
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {week.name}
            </h3>

            {/* Número de semana y año */}
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Semana #{week.weekNumber} • {week.year}
            </p>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onView && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView(week)}
                className="h-8 w-8 p-0"
                title="Ver detalles"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            {canEdit && onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(week)}
                className="h-8 w-8 p-0 hover:text-blue-600 dark:hover:text-blue-400"
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
                className="h-8 w-8 p-0 hover:text-red-600 dark:hover:text-red-400"
                title="Eliminar"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Fechas */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className={cn('h-4 w-4', theme.icon)} />
            <div className="flex-1">
              <p className="text-gray-700 dark:text-gray-300 font-medium">
                {format(start, "d 'de' MMMM", { locale: es })}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Inicio</p>
            </div>
            <div className="w-8 h-px bg-gray-300 dark:bg-gray-600" />
            <div className="flex-1 text-right">
              <p className="text-gray-700 dark:text-gray-300 font-medium">
                {format(end, "d 'de' MMMM", { locale: es })}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Fin</p>
            </div>
          </div>

          {/* Duración */}
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <Clock className="h-3 w-3" />
            <span>
              {Math.ceil(
                (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
              )}{' '}
              días
            </span>
            {isInProgress && (
              <>
                <span>•</span>
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  Día{' '}
                  {Math.ceil(
                    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
                  )}{' '}
                  de{' '}
                  {Math.ceil(
                    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
                  )}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Notas (si existen) */}
        {week.notes && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
              {week.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AcademicWeekCard;
