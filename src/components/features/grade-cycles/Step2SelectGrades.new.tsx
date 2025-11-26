// src/components/features/grade-cycles/Step2SelectGrades.new.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertTriangle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import type { AvailableGrade, AvailableCycle } from '@/types/grade-cycles.types';
import { gradeCyclesService } from '@/services/grade-cycles.service';

interface Step2SelectGradesProps {
  cycle: AvailableCycle;
  selectedGradeIds: string[];
  onSelect: (gradeIds: string[]) => void;
  onBack: () => void;
  onNext: () => void;
}

/**
 * Paso 2: Seleccionar grados para el ciclo
 */
export function Step2SelectGrades({
  cycle,
  selectedGradeIds,
  onSelect,
  onBack,
  onNext,
}: Step2SelectGradesProps) {
  const [grades, setGrades] = useState<AvailableGrade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGrades = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await gradeCyclesService.getAvailableGradesForCycle(
          cycle.id
        );
        setGrades(data);
      } catch (err: any) {
        console.error('Error loading grades:', err);
        setError(err.message || 'Error al cargar grados');
      } finally {
        setIsLoading(false);
      }
    };

    loadGrades();
  }, [cycle.id]);

  const handleToggleGrade = (gradeId: number) => {
    const newIds = selectedGradeIds.includes(gradeId.toString())
      ? selectedGradeIds.filter((id) => id !== gradeId.toString())
      : [...selectedGradeIds, gradeId.toString()];
    onSelect(newIds);
  };

  // Group grades by education level
  const groupedGrades: Record<string, AvailableGrade[]> = {};
  grades.forEach((grade) => {
    const level = grade.level || 'Otros';
    if (!groupedGrades[level]) {
      groupedGrades[level] = [];
    }
    groupedGrades[level].push(grade);
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-lime-600 dark:text-lime-500" />
        <p className="text-gray-600 dark:text-gray-400">Cargando grados...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
        <p className="text-red-800 dark:text-red-300 font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Selecciona los Grados
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Elige los grados disponibles en el ciclo{' '}
          <strong className="text-lime-600 dark:text-lime-500">{cycle.name}</strong>
        </p>
        <div className="h-1 w-20 bg-lime-600 dark:bg-lime-500 rounded-full" />
      </div>

      {/* Grades */}
      {grades.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            No hay grados disponibles
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedGrades).map(([level, levelGrades]) => (
            <div key={level}>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-lime-600" />
                  {level}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {levelGrades.map((grade) => {
                  const isSelected = selectedGradeIds.includes(grade.id.toString());

                  return (
                    <button
                      key={grade.id}
                      onClick={() => handleToggleGrade(grade.id)}
                      className={`group relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        isSelected
                          ? 'border-lime-500 dark:border-lime-500 bg-lime-50 dark:bg-lime-950/30 shadow-lg shadow-lime-500/20'
                          : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-lime-300 dark:hover:border-lime-700 hover:shadow-md'
                      }`}
                    >
                      {/* Checkbox */}
                      <div className="absolute top-4 right-4">
                        <div
                          className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? 'border-lime-600 dark:border-lime-500 bg-lime-600 dark:bg-lime-500'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          {isSelected && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M5 13l4 4L19 7"></path>
                            </svg>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="space-y-2 pr-10">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-lime-100 dark:bg-lime-950/30 border-2 border-lime-200 dark:border-lime-800 flex-shrink-0 mb-2">
                          <BookOpen className="w-5 h-5 text-lime-600 dark:text-lime-500" />
                        </div>

                        <h4 className="text-base font-bold text-gray-900 dark:text-white">
                          {grade.name}
                        </h4>

                        {grade.level && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {grade.level}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Navigation */}
      {grades.length > 0 && (
        <div className="flex justify-between items-center pt-8 border-t-2 border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>{selectedGradeIds.length}</strong> grado
            {selectedGradeIds.length !== 1 ? 's' : ''} seleccionado
            {selectedGradeIds.length !== 1 ? 's' : ''}
          </p>

          <div className="flex gap-3">
            <Button
              onClick={onBack}
              variant="outline"
              className="gap-2 border-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Atrás
            </Button>

            <Button
              onClick={onNext}
              disabled={selectedGradeIds.length === 0}
              className="gap-2 bg-lime-600 hover:bg-lime-700 text-white dark:bg-lime-600 dark:hover:bg-lime-700 disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px]"
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
