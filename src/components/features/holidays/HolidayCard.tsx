// src/components/features/holidays/HolidayCard.tsx

'use client';

import React from 'react';
import { Calendar, Edit2, Trash2, Eye, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Holiday } from '@/types/holidays.types';
import { cn } from '@/lib/utils';
import { parseISODateForTimezone } from '@/utils/dateUtils';

interface HolidayCardProps {
  holiday: Holiday;
  onView?: (holiday: Holiday) => void;
  onEdit?: (holiday: Holiday) => void;
  onDelete?: (holiday: Holiday) => void;
  canView?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

/**
 * 📅 Tarjeta individual de Día Festivo
 * 
 * Muestra:
 * - Fecha del día festivo
 * - Descripción
 * - Estado (recuperable o no)
 * - Información del bimestre
 * - Acciones (ver, editar, eliminar)
 */
export function HolidayCard({
  holiday,
  onView,
  onEdit,
  onDelete,
  canView = false,
  canEdit = false,
  canDelete = false,
}: HolidayCardProps) {
  const holidayDate = parseISODateForTimezone(holiday.date);
  const isPast = holidayDate < new Date();
  const isArchived = holiday.bimester?.cycle?.isArchived;

  return (
    <Card
      className={cn(
        'group hover:shadow-lg transition-all duration-200',
        'bg-white dark:bg-gray-900',
        'border-l-4',
        holiday.isRecovered 
          ? 'border-l-emerald-500 dark:border-l-emerald-400'
          : 'border-l-rose-500 dark:border-l-rose-400',
        isPast && 'opacity-75'
      )}
    >
      <CardContent className="p-4">
        {/* Header con fecha */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {/* Badge de fecha */}
              <div className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg',
                holiday.isRecovered
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300'
              )}>
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-semibold">
                  {format(holidayDate, "d 'de' MMMM, yyyy", { locale: es })}
                </span>
              </div>

              {/* Badge estado recuperable */}
              {holiday.isRecovered ? (
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Recuperable
                </Badge>
              ) : (
                <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800">
                  <XCircle className="h-3 w-3 mr-1" />
                  No recuperable
                </Badge>
              )}

              {/* Badge de pasado */}
              {isPast && (
                <Badge variant="outline" className="text-gray-500 dark:text-gray-400">
                  Pasado
                </Badge>
              )}
            </div>

            {/* Descripción */}
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {holiday.description}
            </h3>

            {/* Información del bimestre y ciclo */}
            {holiday.bimester && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="font-medium">Bimestre {holiday.bimester.number}:</span>
                  {holiday.bimester.name}
                </span>
                {holiday.bimester.cycle && (
                  <>
                    <span>•</span>
                    <span>{holiday.bimester.cycle.name}</span>
                    {isArchived && (
                      <Badge variant="outline" className="text-xs">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Archivado
                      </Badge>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Día de la semana */}
        <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {format(holidayDate, 'EEEE', { locale: es })}
          </p>
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-end gap-2">
          {canView && onView && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(holiday)}
              className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-400"
              title="Ver detalles"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {canEdit && onEdit && !isArchived && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(holiday)}
              className="h-8 w-8 p-0 hover:bg-sky-100 dark:hover:bg-sky-900/30 hover:text-sky-600 dark:hover:text-sky-400"
              title="Editar"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
          {canDelete && onDelete && !isArchived && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(holiday)}
              className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
              title="Eliminar"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default HolidayCard;
