// src/components/features/grades/DeleteGradeDialog.tsx

'use client';

import React, { useEffect } from 'react';
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
import { Loader2, AlertTriangle, Info, Users, Repeat } from 'lucide-react';
import { Grade } from '@/types/grades.types';
import { useGradeStats } from '@/hooks/data/useGradeStats';

interface DeleteGradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grade: Grade | null;
  onConfirm: () => Promise<void>;
  onDeactivate?: () => Promise<void>;
  isDeleting?: boolean;
}

/**
 * 🗑️ Dialog de confirmación para eliminar grado con verificación de dependencias
 */
export function DeleteGradeDialog({
  open,
  onOpenChange,
  grade,
  onConfirm,
  onDeactivate,
  isDeleting = false,
}: DeleteGradeDialogProps) {
  const { stats, isLoading: loadingStats, hasDependencies } = useGradeStats(open ? grade?.id || null : null);

  if (!grade) return null;

  const handleConfirm = async () => {
    await onConfirm();
  };

  const handleDeactivate = async () => {
    if (onDeactivate) {
      await onDeactivate();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md bg-white dark:bg-gray-900">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            {hasDependencies ? 'Grado con Dependencias' : 'Confirmar Eliminación'}
          </AlertDialogTitle>
        </AlertDialogHeader>
        
        <div className="space-y-4 pt-2">
          {/* Información del grado */}
          <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Grado:
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {grade.name}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Nivel:
              </span>
              <Badge variant="outline">{grade.level}</Badge>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Estado:
              </span>
              <Badge
                variant={grade.isActive ? 'default' : 'secondary'}
                className={
                  grade.isActive
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                }
              >
                {grade.isActive ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </div>

          {/* Verificando dependencias */}
          {loadingStats && (
              <div className="flex items-center justify-center gap-2 py-4">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Verificando dependencias...
                </span>
              </div>
            )}

            {/* Estadísticas de dependencias */}
            {!loadingStats && stats && hasDependencies && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-700 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-2">
                      Este grado tiene dependencias
                    </div>
                    
                    <div className="space-y-2">
                      {stats.stats.sectionsCount > 0 && (
                        <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
                          <Users className="h-4 w-4" />
                          <span>{stats.stats.sectionsCount} sección(es) asociada(s)</span>
                        </div>
                      )}
                      {stats.stats.cyclesCount > 0 && (
                        <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
                          <Repeat className="h-4 w-4" />
                          <span>{stats.stats.cyclesCount} ciclo(s) asociado(s)</span>
                        </div>
                      )}
                    </div>

                    <div className="text-sm text-amber-700 dark:text-amber-300 mt-3">
                      No se puede eliminar permanentemente. Se recomienda desactivar el grado en su lugar.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sin dependencias */}
            {!loadingStats && !hasDependencies && (
              <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  ¿Está seguro que desea eliminar permanentemente este grado? Esta acción no se puede deshacer.
                </div>
              </div>
            )}
          </div>

          <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          
          {!loadingStats && hasDependencies && onDeactivate ? (
            <AlertDialogAction
              onClick={handleDeactivate}
              disabled={isDeleting}
              className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Desactivar Grado
            </AlertDialogAction>
          ) : !loadingStats && !hasDependencies ? (
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar Permanentemente
            </AlertDialogAction>
          ) : null}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteGradeDialog;
