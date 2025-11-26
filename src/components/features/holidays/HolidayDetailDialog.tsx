// src/components/features/holidays/HolidayDetailDialog.tsx

'use client';

import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, BookOpen, FileText, CheckCircle2, XCircle, Archive } from 'lucide-react';
import { Holiday } from '@/types/holidays.types';

interface HolidayDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  holiday: Holiday | null;
}

/**
 * 📄 Dialog para ver detalles completos de un día festivo
 */
export function HolidayDetailDialog({
  open,
  onOpenChange,
  holiday,
}: HolidayDetailDialogProps) {
  if (!holiday) return null;

  const isArchived = holiday.bimester?.cycle.isArchived ?? false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Detalle del Día Festivo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Descripción */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Descripción
              </p>
              <p className="text-base font-semibold text-gray-900 dark:text-gray-100 break-words">
                {holiday.description}
              </p>
            </div>
          </div>

          {/* Fecha */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <Calendar className="h-5 w-5 text-rose-600 dark:text-rose-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Fecha
              </p>
              <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {format(new Date(holiday.date), "EEEE d 'de' MMMM, yyyy", { locale: es })}
              </p>
            </div>
          </div>

          {/* Bimestre */}
          {holiday.bimester && (
            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Bimestre
                </p>
                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Bimestre {holiday.bimester.number} - {holiday.bimester.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {format(new Date(holiday.bimester.startDate), 'd MMM', { locale: es })} -{' '}
                  {format(new Date(holiday.bimester.endDate), 'd MMM yyyy', { locale: es })}
                </p>
              </div>
            </div>
          )}

          {/* Ciclo Escolar */}
          {holiday.bimester && (
            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Ciclo Escolar
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    {holiday.bimester.cycle.name}
                  </p>
                  {isArchived && (
                    <Badge variant="secondary" className="gap-1 bg-gray-200 dark:bg-gray-700">
                      <Archive className="h-3 w-3" />
                      Archivado
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Estado de Recuperación */}
          <div 
            className="flex items-start gap-3 p-4 rounded-lg border-2 dark:bg-opacity-10" 
            style={{
              backgroundColor: holiday.isRecovered 
                ? 'rgb(236 253 245 / 0.5)' // emerald-50/50
                : 'rgb(255 241 242 / 0.5)', // rose-50/50
              borderColor: holiday.isRecovered
                ? 'rgb(16 185 129)' // emerald-500
                : 'rgb(244 63 94)', // rose-500
            }}
          >
            {holiday.isRecovered ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Recuperación
              </p>
              <p className="text-base font-semibold" style={{
                color: holiday.isRecovered
                  ? 'rgb(5 150 105)' // emerald-600
                  : 'rgb(225 29 72)', // rose-600
              }}>
                {holiday.isRecovered ? 'Día Recuperable' : 'Día No Recuperable'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {holiday.isRecovered
                  ? 'Este día será recuperado en otra fecha'
                  : 'Este día no requiere recuperación'}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline" className="border-gray-300 dark:border-gray-600">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default HolidayDetailDialog;
