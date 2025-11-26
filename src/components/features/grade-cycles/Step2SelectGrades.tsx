// src/components/features/grade-cycles/Step2SelectGrades.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Loader2,
  GraduationCap,
  CheckCircle2,
  Circle,
  Layers,
} from 'lucide-react';
import type { AvailableGrade, AvailableCycle } from '@/types/grade-cycles.types';
import { gradeCyclesService } from '@/services/grade-cycles.service';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface Step2SelectGradesProps {
  cycle: AvailableCycle;
  selectedGradeIds: string[];
  onSelect: (gradeIds: string[]) => void;
  onBack: () => void;
  onNext: () => void;
}

/**
 * 📚 Paso 2: Seleccionar grados - Diseño moderno con multi-selección
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
      <div className="flex flex-col items-center justify-center py-24 space-y-6">
        <div className="relative">
          <Loader2 className="w-16 h-16 animate-spin text-indigo-600 dark:text-indigo-500" strokeWidth={2.5} />
          <div className="absolute inset-0 w-16 h-16 rounded-full bg-indigo-500/20 animate-ping" />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Cargando grados disponibles
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Por favor espera un momento...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-10 text-center">
        <div className="inline-flex p-4 bg-red-100 dark:bg-red-950/40 rounded-2xl mb-4">
          <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" strokeWidth={2.5} />
        </div>
        <h3 className="text-lg font-bold text-red-900 dark:text-red-300 mb-2">Error al Cargar</h3>
        <p className="text-red-700 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 bg-violet-100 dark:bg-violet-950/30 rounded-2xl border-2 border-violet-200 dark:border-violet-800 shadow-lg shadow-violet-500/10">
            <Layers className="w-10 h-10 text-violet-600 dark:text-violet-500" strokeWidth={2.5} />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
            Selecciona los Grados
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Elige los grados que estarán disponibles en el ciclo{' '}
            <span className="font-bold text-indigo-600 dark:text-indigo-500">{cycle.name}</span>
          </p>
        </div>

        {/* Grades */}
        {grades.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-16 text-center">
            <BookOpen className="w-20 h-20 text-gray-300 dark:text-gray-700 mx-auto mb-5" strokeWidth={1.5} />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No hay grados disponibles
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              No se encontraron grados para este ciclo
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(groupedGrades).map(([level, levelGrades]) => (
              <div key={level}>
                {/* Level header */}
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-2 h-2 rounded-full bg-violet-600 dark:bg-violet-500" />
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {level}
                    </h3>
                    <Badge className="bg-violet-100 text-violet-800 border-2 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800 font-bold px-3 py-1">
                      {levelGrades.length} {levelGrades.length === 1 ? 'grado' : 'grados'}
                    </Badge>
                  </div>
                </div>

                {/* Grades grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {levelGrades.map((grade) => {
                    const isSelected = selectedGradeIds.includes(grade.id.toString());

                    return (
                      <Tooltip key={grade.id}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleToggleGrade(grade.id)}
                            className={`group relative p-6 rounded-2xl border-2 text-left transition-all duration-300 cursor-pointer ${
                              isSelected
                                ? 'border-violet-500 dark:border-violet-500 bg-violet-50 dark:bg-violet-950/30 shadow-xl shadow-violet-500/20 scale-[1.02]'
                                : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-lg hover:scale-[1.01]'
                            }`}
                          >
                            {/* Checkbox indicator */}
                            <div className="absolute top-4 right-4">
                              <div
                                className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all shadow-sm ${
                                  isSelected
                                    ? 'border-violet-600 dark:border-violet-500 bg-violet-600 dark:bg-violet-500 shadow-violet-500/30'
                                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 group-hover:border-violet-400'
                                }`}
                              >
                                {isSelected ? (
                                  <CheckCircle2 className="w-5 h-5 text-white" strokeWidth={2.5} />
                                ) : (
                                  <Circle className="w-5 h-5 text-gray-400" strokeWidth={2} />
                                )}
                              </div>
                            </div>

                            {/* Icon decorativo de fondo */}
                            <div className="absolute bottom-2 right-2 opacity-5 group-hover:opacity-10 transition-opacity">
                              <GraduationCap className="w-20 h-20 text-violet-600" strokeWidth={1} />
                            </div>

                            {/* Content */}
                            <div className="relative space-y-4 pr-10">
                              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border-2 transition-all ${
                                isSelected
                                  ? 'bg-violet-600 dark:bg-violet-500 border-violet-500 shadow-lg shadow-violet-500/30'
                                  : 'bg-violet-100 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800 group-hover:bg-violet-200 dark:group-hover:bg-violet-900/40'
                              }`}>
                                <GraduationCap className={`w-7 h-7 transition-colors ${
                                  isSelected ? 'text-white' : 'text-violet-600 dark:text-violet-500'
                                }`} strokeWidth={2.5} />
                              </div>

                              <div>
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                                  {grade.name}
                                </h4>
                                {grade.level && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                    {grade.level}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Bottom accent */}
                            <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl transition-all ${
                              isSelected ? 'bg-violet-600 dark:bg-violet-500' : 'bg-transparent group-hover:bg-violet-400'
                            }`} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0 px-4 py-2">
                          <p className="font-semibold">
                            {isSelected ? `Deseleccionar ${grade.name}` : `Seleccionar ${grade.name}`}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Navigation */}
        {grades.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t-2 border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 ${
                selectedGradeIds.length > 0
                  ? 'bg-violet-100 dark:bg-violet-950/30 border-violet-300 dark:border-violet-800'
                  : 'bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-700'
              }`}>
                <Layers className={`w-5 h-5 ${
                  selectedGradeIds.length > 0
                    ? 'text-violet-600 dark:text-violet-500'
                    : 'text-gray-500 dark:text-gray-500'
                }`} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {selectedGradeIds.length} grado{selectedGradeIds.length !== 1 ? 's' : ''} seleccionado{selectedGradeIds.length !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {selectedGradeIds.length === 0 ? 'Selecciona al menos uno' : 'Listo para continuar'}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={onBack}
                    variant="outline"
                    className="gap-2 border-2 h-12 px-6 font-semibold"
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
                    onClick={onNext}
                    disabled={selectedGradeIds.length === 0}
                    className="gap-2 bg-violet-600 hover:bg-violet-700 text-white dark:bg-violet-600 dark:hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed min-w-[180px] h-12 text-base font-bold shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 transition-all border-2 border-violet-700 dark:border-violet-500"
                  >
                    Continuar
                    <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                  <p className="font-semibold">
                    {selectedGradeIds.length === 0 ? 'Selecciona al menos un grado' : 'Ir al siguiente paso'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
