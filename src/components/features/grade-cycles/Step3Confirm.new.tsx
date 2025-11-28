// src/components/features/grade-cycles/Step3Confirm.new.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
 * Paso 3: Confirmar y guardar configuración
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

  const groupedGrades: Record<string, AvailableGrade[]> = {};
  selectedGrades.forEach((grade) => {
    const level = grade.level || 'Otros';
    if (!groupedGrades[level]) {
      groupedGrades[level] = [];
    }
    groupedGrades[level].push(grade);
  });

  const handleConfirm = async () => {
    try {
      setIsSaving(true);
      setError(null);
      await onConfirm();
    } catch (err: any) {
      setError(err.message || 'Error al guardar la configuración');
      setIsSaving(false);
    }
  };

  return (
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

      {/* Cycle Card */}
      <div className="rounded-xl border-2 border-lime-200 dark:border-lime-800 bg-gradient-to-br from-lime-50 to-white dark:from-lime-950/20 dark:to-gray-900 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-lime-100 dark:bg-lime-950/30 border-2 border-lime-300 dark:border-lime-700 flex-shrink-0">
            <Calendar className="w-7 h-7 text-lime-600 dark:text-lime-500" />
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {cycle.name}
            </h3>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">
                  Inicio
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {new Date(cycle.startDate).toLocaleDateString('es-ES')}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">
                  Fin
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {new Date(cycle.endDate).toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              {cycle.isActive && (
                <Badge className="bg-emerald-100 text-emerald-800 border-2 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 font-semibold">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
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

      {/* Grades */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-lime-600 dark:text-lime-500" />
        </div>
      ) : selectedGrades.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            No hay grados seleccionados
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-lime-600 dark:text-lime-500" />
            Grados Seleccionados
            <Badge className="ml-auto bg-lime-100 text-lime-800 border-2 border-lime-200 dark:bg-lime-950 dark:text-lime-300 dark:border-lime-800 font-bold">
              {selectedGrades.length}
            </Badge>
          </h3>

          {Object.entries(groupedGrades).map(([level, levelGrades]) => (
            <div key={level}>
              <div className="mb-4">
                <h4 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-lime-600" />
                  {level}
                  <Badge className="ml-auto bg-gray-100 text-gray-800 border-2 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                    {levelGrades.length}
                  </Badge>
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {levelGrades.map((grade) => (
                  <div
                    key={grade.id}
                    className="rounded-xl border-2 border-lime-200 dark:border-lime-800 bg-lime-50 dark:bg-lime-950/20 p-4 flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-lime-600 dark:text-lime-500 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 dark:text-white">
                        {grade.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {grade.level}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800 dark:text-red-300">Error</p>
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="rounded-xl border-2 border-gray-200 dark:border-gray-800 p-6 space-y-4">
        <h4 className="font-bold text-gray-900 dark:text-white">Resumen</h4>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Ciclo Escolar</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {cycle.name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Grados</span>
            <span className="font-semibold text-gray-900 dark:text-white">
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

      {/* Navigation */}
      <div className="flex justify-between items-center pt-8 border-t-2 border-gray-200 dark:border-gray-800">
        <Button
          onClick={onBack}
          disabled={isSaving}
          variant="outline"
          className="gap-2 border-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Atrás
        </Button>

        <Button
          onClick={handleConfirm}
          disabled={isSaving || selectedGrades.length === 0}
          className="gap-2 bg-lime-600 hover:bg-lime-700 text-white dark:bg-lime-600 dark:hover:bg-lime-700 disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px]"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Guardar
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
