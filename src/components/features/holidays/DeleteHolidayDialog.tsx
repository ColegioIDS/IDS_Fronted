// src/components/features/holidays/DeleteHolidayDialog.tsx

'use client';

import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
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
import { Badge } from '@/components/ui/badge';
import { Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { Holiday } from '@/types/holidays.types';
import { parseISODateForTimezone } from '@/utils/dateUtils';

interface DeleteHolidayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  holiday: Holiday | null;
  onConfirm: () => Promise<void>;
  isDeleting?: boolean;
}

/**
 * 🗑️ Dialog de confirmación para eliminar día festivo
 */
export function DeleteHolidayDialog({
  open,
  onOpenChange,
  holiday,
  onConfirm,
  isDeleting = false,
}: DeleteHolidayDialogProps) {
  if (!holiday) return null;

  const handleConfirm = async () => {
    await onConfirm();
    // El componente padre cerrará el dialog
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md bg-white dark:bg-gray-900">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Confirmar Eliminación
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4 pt-2">
            <p className="text-gray-700 dark:text-gray-300">
              ¿Está seguro que desea eliminar el siguiente día festivo?
            </p>

            {/* Información del día festivo */}
            <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Descripción:
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {holiday.description}
                </p>
              </div>

              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Fecha:
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {format(parseISODateForTimezone(holiday.date), "d 'de' MMMM, yyyy", { locale: es })}
                </p>
              </div>

              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Bimestre:
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {holiday.bimester ? `Bimestre ${holiday.bimester.number}` : 'N/A'}
                </p>
              </div>

              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Recuperable:
                </p>
                <Badge 
                  variant={holiday.isRecovered ? 'default' : 'secondary'}
                  className={
                    holiday.isRecovered
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                      : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700'
                  }
                >
                  {holiday.isRecovered ? 'Sí' : 'No'}
                </Badge>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">
                Esta acción no se puede deshacer. El día festivo será eliminado permanentemente.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            disabled={isDeleting}
            className="border-gray-300 dark:border-gray-600"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteHolidayDialog;
