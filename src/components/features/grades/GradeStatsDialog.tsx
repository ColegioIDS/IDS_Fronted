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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Loader2, Users, Repeat, X, TrendingUp, AlertCircle, CheckCircle2, Target } from 'lucide-react';
import { Grade } from '@/types/grades.types';
import { useGradeStats } from '@/hooks/data/useGradeStats';

interface GradeStatsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grade: Grade | null;
}

/**
 * 📊 Dialog de estadísticas de grado sin gradientes
 */
export function GradeStatsDialog({
  open,
  onOpenChange,
  grade,
}: GradeStatsDialogProps) {
  const { stats, isLoading, error } = useGradeStats(open ? grade?.id || null : null);

  if (!grade) return null;

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden bg-white dark:bg-gray-900 flex flex-col">
          {/* Header con diseño azul sólido (sin gradiente) */}
          <div className="bg-indigo-600 dark:bg-indigo-700 border-b-2 border-indigo-700 dark:border-indigo-800 px-6 py-5 relative overflow-hidden flex-shrink-0">
            {/* Decorative circles */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full" />

            <DialogHeader className="relative z-10">
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" strokeWidth={2.5} />
                </div>
                Estadísticas del Grado
              </DialogTitle>
              <p className="text-indigo-100 mt-2 text-sm">
                Relaciones y dependencias del grado
              </p>
            </DialogHeader>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-white dark:bg-gray-900">
            {/* Información del grado (sin gradiente) */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-800 rounded-xl p-5 relative overflow-hidden">
              {/* Decorative element */}
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-full opacity-50" />

              <div className="relative z-10">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {grade.name}
                </h3>
                <p className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">
                  {grade.level} • Orden: {grade.order}
                </p>
              </div>
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600 dark:text-indigo-400 mb-4" strokeWidth={2.5} />
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Cargando estadísticas...
                </p>
              </div>
            )}

            {/* Error */}
            {error && !isLoading && (
              <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800 rounded-xl p-5 flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                <div>
                  <p className="font-bold text-red-800 dark:text-red-300 mb-1">Error al cargar</p>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Estadísticas */}
            {stats && !isLoading && !error && (
              <div className="grid grid-cols-2 gap-4">
                {/* Secciones */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="bg-white dark:bg-gray-800 border-2 border-indigo-200 dark:border-indigo-800 rounded-xl p-6
                      hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-help group relative overflow-hidden">
                      <div className="absolute -right-2 -bottom-2 opacity-5">
                        <Target className="w-20 h-20" strokeWidth={1} />
                      </div>

                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-indigo-100 dark:bg-indigo-950/50 border-2 border-indigo-300 dark:border-indigo-700
                            group-hover:scale-110 transition-transform duration-300 shadow-md">
                            <Users className="h-7 w-7 text-indigo-600 dark:text-indigo-400" strokeWidth={2.5} />
                          </div>
                        </div>
                        <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2 tabular-nums">
                          {stats.stats.sectionsCount}
                        </p>
                        <p className="text-sm font-bold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
                          {stats.stats.sectionsCount === 1 ? 'Sección' : 'Secciones'}
                        </p>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                    <p className="font-semibold">Número de secciones que usan este grado</p>
                  </TooltipContent>
                </Tooltip>

                {/* Ciclos */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6
                      hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-help group relative overflow-hidden">
                      <div className="absolute -right-2 -bottom-2 opacity-5">
                        <Target className="w-20 h-20" strokeWidth={1} />
                      </div>

                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-950/50 border-2 border-blue-300 dark:border-blue-700
                            group-hover:scale-110 transition-transform duration-300 shadow-md">
                            <Repeat className="h-7 w-7 text-blue-600 dark:text-blue-400" strokeWidth={2.5} />
                          </div>
                        </div>
                        <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2 tabular-nums">
                          {stats.stats.cyclesCount}
                        </p>
                        <p className="text-sm font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                          {stats.stats.cyclesCount === 1 ? 'Ciclo' : 'Ciclos'}
                        </p>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                    <p className="font-semibold">Número de ciclos escolares relacionados</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}

            {/* Información adicional con dependencias */}
            {stats && !isLoading && (stats.stats.sectionsCount > 0 || stats.stats.cyclesCount > 0) && (
              <div className="bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-5 flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                <div>
                  <p className="font-bold text-blue-800 dark:text-blue-300 mb-1.5">
                    Grado en uso
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                    Este grado está siendo utilizado. Si desea eliminarlo, primero debe desasociar todas las secciones y ciclos, o puede desactivarlo en su lugar.
                  </p>
                </div>
              </div>
            )}

            {/* Información sin dependencias */}
            {stats && !isLoading && stats.stats.sectionsCount === 0 && stats.stats.cyclesCount === 0 && (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl p-5 flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                <div>
                  <p className="font-bold text-emerald-800 dark:text-emerald-300 mb-1.5">
                    Sin dependencias
                  </p>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300 leading-relaxed">
                    Este grado no tiene dependencias. Puede eliminarlo de forma segura si lo desea.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 px-6 py-4 border-t-2 border-gray-200 dark:border-gray-700
            bg-gray-50 dark:bg-gray-900/50 flex-shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="border-2 border-gray-300 dark:border-gray-600
                    hover:bg-gray-100 dark:hover:bg-gray-800
                    font-semibold"
                >
                  <X className="h-4 w-4 mr-2" strokeWidth={2.5} />
                  Cerrar
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                <p className="font-semibold">Cerrar ventana de estadísticas</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}

export default GradeStatsDialog;
