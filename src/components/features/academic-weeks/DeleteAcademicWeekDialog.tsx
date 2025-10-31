// src/components/features/academic-weeks/DeleteAcademicWeekDialog.tsx

'use client';

import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AcademicWeek, WEEK_TYPE_LABELS } from '@/types/academic-week.types';
import { getWeekTypeTheme } from '@/config/theme.config';
import { cn } from '@/lib/utils';

interface DeleteAcademicWeekDialogProps {
  week: AcademicWeek | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting?: boolean;
}

/**
 * 🗑️ Diálogo de confirmación para eliminar Semana Académica
 * 
 * Muestra detalles de la semana antes de eliminar
 */
export function DeleteAcademicWeekDialog({
  week,
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
}: DeleteAcademicWeekDialogProps) {
  if (!week) return null;

  const theme = getWeekTypeTheme(week.weekType);

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <AlertDialogTitle className="text-xl">
                ¿Eliminar semana académica?
              </AlertDialogTitle>
            </div>
          </div>

          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Esta acción no se puede deshacer. Se eliminará permanentemente la
                siguiente semana académica:
              </p>

              {/* Información de la semana */}
              <div
                className={cn(
                  'p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4',
                  theme.border,
                )}
              >
                <div className="space-y-3">
                  {/* Identificación */}
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Semana
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Semana {week.number} - {WEEK_TYPE_LABELS[week.weekType]}
                    </p>
                  </div>

                  {/* Tipo y Estado */}
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Tipo
                      </p>
                      <span className={cn('px-2 py-1 rounded text-xs font-medium', theme.badge)}>
                        {WEEK_TYPE_LABELS[week.weekType]}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Estado
                      </p>
                      <p
                        className={cn(
                          'text-sm font-medium',
                          week.isActive
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-500 dark:text-gray-400',
                        )}
                      >
                        {week.isActive ? 'Activa' : 'Inactiva'}
                      </p>
                    </div>
                  </div>

                  {/* Fechas */}
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Periodo
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {format(new Date(week.startDate), "d 'de' MMMM", { locale: es })} -{' '}
                      {format(new Date(week.endDate), "d 'de' MMMM, yyyy", { locale: es })}
                    </p>
                  </div>

                  {/* Objetivos si existen */}
                  {week.objectives && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Objetivos
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                        "{week.objectives}"
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Advertencia final */}
              <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">
                    Advertencia
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                    Esta acción eliminará todos los registros asociados a esta semana
                    académica. No se puede deshacer.
                  </p>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              'Sí, eliminar semana'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteAcademicWeekDialog;
