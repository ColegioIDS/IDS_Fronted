// src/components/features/grades/GradeStatsDialog.tsx

'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Users, Repeat, X, TrendingUp } from 'lucide-react';
import { Grade } from '@/types/grades.types';
import { useGradeStats } from '@/hooks/data/useGradeStats';

interface GradeStatsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grade: Grade | null;
}

/**
 * 📊 Dialog de estadísticas de grado
 */
export function GradeStatsDialog({
  open,
  onOpenChange,
  grade,
}: GradeStatsDialogProps) {
  const { stats, isLoading, error } = useGradeStats(open ? grade?.id || null : null);

  if (!grade) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            Estadísticas del Grado
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información del grado */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
              {grade.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {grade.level} • Orden: {grade.order}
            </p>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400 mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Cargando estadísticas...
              </p>
            </div>
          )}

          {/* Error */}
          {error && !isLoading && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-700 dark:text-red-300">
                {error}
              </p>
            </div>
          )}

          {/* Estadísticas */}
          {stats && !isLoading && !error && (
            <div className="grid grid-cols-2 gap-4">
              {/* Secciones */}
              <div className="bg-white dark:bg-gray-800 border-2 border-indigo-200 dark:border-indigo-800 rounded-xl p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-950/50">
                    <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                  {stats.stats.sectionsCount}
                </p>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stats.stats.sectionsCount === 1 ? 'Sección' : 'Secciones'}
                </p>
              </div>

              {/* Ciclos */}
              <div className="bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-950/50">
                    <Repeat className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  {stats.stats.cyclesCount}
                </p>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stats.stats.cyclesCount === 1 ? 'Ciclo' : 'Ciclos'}
                </p>
              </div>
            </div>
          )}

          {/* Información adicional */}
          {stats && !isLoading && (stats.stats.sectionsCount > 0 || stats.stats.cyclesCount > 0) && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Nota:</strong> Este grado está en uso. Si desea eliminarlo, primero debe desasociar todas las secciones y ciclos, o puede desactivarlo en su lugar.
              </p>
            </div>
          )}

          {stats && !isLoading && stats.stats.sectionsCount === 0 && stats.stats.cyclesCount === 0 && (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                Este grado no tiene dependencias. Puede eliminarlo de forma segura si lo desea.
              </p>
            </div>
          )}
        </div>

        {/* Botón cerrar */}
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-300 dark:border-gray-600"
          >
            <X className="h-4 w-4 mr-2" />
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default GradeStatsDialog;
