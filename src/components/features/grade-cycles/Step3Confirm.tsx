// src/components/features/grade-cycles/Step3Confirm.tsx

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  Loader2,
  Save,
} from 'lucide-react';
import type { AvailableCycle, AvailableGrade } from '@/types/grade-cycles.types';

interface Step3ConfirmProps {
  cycle: AvailableCycle;
  gradeIds: string[];
  grades: AvailableGrade[];
  isLoading: boolean;
  onBack: () => void;
  onConfirm: () => Promise<void>;
}

/**
 * Paso 3: Confirmar y guardar configuración (sin gradientes + tooltips)
 */
export function Step3Confirm({
  cycle,
  gradeIds,
  grades,
  isLoading,
  onBack,
  onConfirm,
}: Step3ConfirmProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedGrades = grades.filter((g) =>
    gradeIds.includes(g.id.toString())
  );

  // Memoize grade grouping for performance
  const groupedGrades = useMemo(() => {
    const grouped: Record<string, AvailableGrade[]> = {};
    selectedGrades.forEach((grade) => {
      const level = grade.level || 'Otros';
      if (!grouped[level]) {
        grouped[level] = [];
      }
      grouped[level].push(grade);
    });
    return grouped;
  }, [selectedGrades]);

  const handleConfirm = async () => {
    try {
      setIsSaving(true);
      setError(null);
      await onConfirm();
    } catch (err: any) {
      console.error('Error confirming:', err);
      setError(err.message || 'Error al guardar la configuración');
      setIsSaving(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Revisar y Confirmar
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Verifica los datos antes de guardar la configuración
          </p>
          <div className="h-1 w-20 bg-lime-600 dark:bg-lime-500 rounded-full" />
        </div>

        {/* Cycle Card - SIN GRADIENTE */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="rounded-xl border-2 border-lime-200 dark:border-lime-800 bg-lime-50 dark:bg-lime-950/20 p-6 hover:shadow-lg transition-shadow cursor-help">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-lime-100 dark:bg-lime-950/30 border-2 border-lime-300 dark:border-lime-700 flex-shrink-0">
                  <Calendar className="w-7 h-7 text-lime-600 dark:text-lime-500" strokeWidth={2.5} />
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {cycle.name}
                  </h3>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-xs mb-1 font-semibold uppercase tracking-wide">
                        Inicio
                      </p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {new Date(cycle.startDate).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-xs mb-1 font-semibold uppercase tracking-wide">
                        Fin
                      </p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {new Date(cycle.endDate).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    {cycle.isActive && (
                      <Badge className="bg-emerald-100 text-emerald-800 border-2 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 font-semibold">
                        <CheckCircle2 className="w-3 h-3 mr-1" strokeWidth={2.5} />
                        Activo
                      </Badge>
                    )}
                    {cycle.canEnroll && (
                      <Badge className="bg-blue-100 text-blue-800 border-2 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 font-semibold">
                        Inscripción Abierta
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
            <p className="font-semibold">Ciclo escolar seleccionado</p>
          </TooltipContent>
        </Tooltip>

        {/* Grades */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-lime-600 dark:text-lime-500" strokeWidth={2.5} />
          </div>
        ) : selectedGrades.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-gray-600 dark:text-gray-400">
              No hay grados seleccionados
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-lime-600 dark:text-lime-500" strokeWidth={2.5} />
                Grados Seleccionados
              </h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge className="bg-lime-100 text-lime-800 border-2 border-lime-200 dark:bg-lime-950 dark:text-lime-300 dark:border-lime-800 font-bold cursor-help px-4 py-1.5">
                    {selectedGrades.length}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                  <p className="font-semibold">Total de grados seleccionados</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {Object.entries(groupedGrades).map(([level, levelGrades]) => (
              <div key={level}>
                <div className="mb-4">
                  <h4 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-lime-600 dark:bg-lime-500" />
                    {level}
                    <Badge className="ml-auto bg-gray-100 text-gray-800 border-2 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 font-semibold">
                      {levelGrades.length}
                    </Badge>
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {levelGrades.map((grade) => (
                    <Tooltip key={grade.id}>
                      <TooltipTrigger asChild>
                        <div className="rounded-xl border-2 border-lime-200 dark:border-lime-800 bg-lime-50 dark:bg-lime-950/20 p-4 flex items-start gap-3 hover:shadow-md transition-shadow cursor-help">
                          <CheckCircle2 className="w-5 h-5 text-lime-600 dark:text-lime-500 flex-shrink-0 mt-1" strokeWidth={2.5} />
                          <div className="flex-1">
                            <p className="font-bold text-gray-900 dark:text-white">
                              {grade.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                              {grade.level}
                            </p>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                        <p className="font-semibold">Grado {grade.name} - {grade.level}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
            <div>
              <p className="font-semibold text-red-800 dark:text-red-300">Error</p>
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Summary */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="rounded-xl border-2 border-gray-200 dark:border-gray-800 p-6 space-y-4 hover:shadow-md transition-shadow cursor-help">
              <h4 className="font-bold text-gray-900 dark:text-white">Resumen</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Ciclo Escolar</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {cycle.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Grados</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {selectedGrades.length}
                  </span>
                </div>
                <div className="h-px bg-gray-200 dark:bg-gray-800" />
                <div className="flex justify-between text-base font-bold">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-lime-600 dark:text-lime-500">
                    {selectedGrades.length} asignaciones
                  </span>
                </div>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
            <p className="font-semibold">Resumen de la configuración a guardar</p>
          </TooltipContent>
        </Tooltip>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-8 border-t-2 border-gray-200 dark:border-gray-800">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onBack}
                disabled={isSaving}
                variant="outline"
                className="gap-2 border-2"
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
                Atrás
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
              <p className="font-semibold">Volver al paso anterior</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleConfirm}
                disabled={isSaving || selectedGrades.length === 0}
                className="gap-2 bg-lime-600 hover:bg-lime-700 text-white dark:bg-lime-600 dark:hover:bg-lime-700 disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px] font-semibold shadow-md hover:shadow-lg border-2 border-lime-700"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" strokeWidth={2.5} />
                    Guardar
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
              <p className="font-semibold">
                {selectedGrades.length === 0
                  ? 'Selecciona al menos un grado'
                  : 'Guardar configuración de ciclo-grados'}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
