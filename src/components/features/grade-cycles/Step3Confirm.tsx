// src/components/features/grade-cycles/Step3Confirm.tsx

'use client';

import React, { useState, useMemo } from 'react';
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
  Clock,
  GraduationCap,
  CheckCheck,
  Sparkles,
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
 * ✅ Paso 3: Confirmar y guardar configuración - Diseño moderno
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
      <div className="space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 bg-emerald-100 dark:bg-emerald-950/30 rounded-2xl border-2 border-emerald-200 dark:border-emerald-800 shadow-lg shadow-emerald-500/10">
            <CheckCheck className="w-10 h-10 text-emerald-600 dark:text-emerald-500" strokeWidth={2.5} />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
            Revisar y Confirmar
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Verifica cuidadosamente la información antes de guardar la configuración del ciclo escolar
          </p>
        </div>

        {/* Cycle Card */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/20 p-8 hover:shadow-xl transition-all cursor-help group">
              <div className="flex items-start gap-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-600 dark:bg-indigo-500 border-2 border-indigo-500 dark:border-indigo-400 flex-shrink-0 shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                  <Calendar className="w-10 h-10 text-white" strokeWidth={2.5} />
                </div>

                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {cycle.name}
                  </h3>

                  <div className="grid grid-cols-2 gap-5">
                    <div className="p-4 bg-white dark:bg-gray-950 rounded-xl border-2 border-indigo-100 dark:border-indigo-900">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-500" strokeWidth={2.5} />
                        <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                          Fecha de Inicio
                        </p>
                      </div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {new Date(cycle.startDate).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-950 rounded-xl border-2 border-indigo-100 dark:border-indigo-900">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-red-600 dark:text-red-500" strokeWidth={2.5} />
                        <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                          Fecha de Fin
                        </p>
                      </div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {new Date(cycle.endDate).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-5">
                    {cycle.isActive && (
                      <Badge className="bg-emerald-100 text-emerald-800 border-2 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 font-bold text-sm px-4 py-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 mr-2 animate-pulse" />
                        Ciclo Activo
                      </Badge>
                    )}
                    {cycle.canEnroll && (
                      <Badge className="bg-blue-100 text-blue-800 border-2 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 font-bold text-sm px-4 py-2">
                        <Sparkles className="w-4 h-4 mr-2" strokeWidth={2.5} />
                        Inscripción Abierta
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0 px-4 py-2">
            <p className="font-semibold">Ciclo escolar seleccionado para la configuración</p>
          </TooltipContent>
        </Tooltip>

        {/* Grades */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="relative">
              <Loader2 className="w-16 h-16 animate-spin text-violet-600 dark:text-violet-500" strokeWidth={2.5} />
              <div className="absolute inset-0 w-16 h-16 rounded-full bg-violet-500/20 animate-ping" />
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              Cargando información de grados...
            </p>
          </div>
        ) : selectedGrades.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-16 text-center">
            <BookOpen className="w-20 h-20 text-gray-300 dark:text-gray-700 mx-auto mb-5" strokeWidth={1.5} />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No hay grados seleccionados
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Vuelve al paso anterior para seleccionar grados
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-950/30 border-2 border-violet-300 dark:border-violet-800">
                  <GraduationCap className="w-7 h-7 text-violet-600 dark:text-violet-500" strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Grados Seleccionados
                </h3>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge className="bg-violet-600 dark:bg-violet-500 text-white border-2 border-violet-700 dark:border-violet-600 font-bold cursor-help px-5 py-2.5 text-lg shadow-lg shadow-violet-500/30">
                    {selectedGrades.length}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                  <p className="font-semibold">Total de grados que se configurarán</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {Object.entries(groupedGrades).map(([level, levelGrades]) => (
              <div key={level}>
                <div className="mb-5 flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-violet-600 dark:bg-violet-500" />
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                    {level}
                  </h4>
                  <Badge className="bg-gray-100 text-gray-800 border-2 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 font-bold px-3 py-1">
                    {levelGrades.length}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {levelGrades.map((grade) => (
                    <Tooltip key={grade.id}>
                      <TooltipTrigger asChild>
                        <div className="rounded-xl border-2 border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/20 p-5 flex items-center gap-4 hover:shadow-lg transition-all cursor-help group">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600 dark:bg-violet-500 flex-shrink-0 shadow-md shadow-violet-500/30 group-hover:scale-110 transition-transform">
                            <CheckCircle2 className="w-7 h-7 text-white" strokeWidth={2.5} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 dark:text-white text-base truncate">
                              {grade.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium truncate">
                              {grade.level}
                            </p>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                        <p className="font-semibold">Grado: {grade.name} - {grade.level}</p>
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
          <div className="rounded-2xl border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-6 flex gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-600 dark:bg-red-500 flex-shrink-0">
              <AlertTriangle className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-red-900 dark:text-red-300 text-lg mb-1">Error al Guardar</p>
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Summary */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-8 space-y-6 hover:shadow-xl transition-shadow cursor-help">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800">
                  <CheckCheck className="w-6 h-6 text-gray-700 dark:text-gray-300" strokeWidth={2.5} />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">Resumen de Configuración</h4>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                  <span className="text-gray-600 dark:text-gray-400 font-semibold">Ciclo Escolar</span>
                  <span className="font-bold text-gray-900 dark:text-white text-lg">
                    {cycle.name}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                  <span className="text-gray-600 dark:text-gray-400 font-semibold">Cantidad de Grados</span>
                  <span className="font-bold text-gray-900 dark:text-white text-lg">
                    {selectedGrades.length}
                  </span>
                </div>
                <div className="h-px bg-gray-200 dark:bg-gray-800" />
                <div className="flex justify-between items-center p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border-2 border-emerald-200 dark:border-emerald-800">
                  <span className="text-gray-900 dark:text-white font-bold text-lg">Total de Asignaciones</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-500 text-2xl">
                    {selectedGrades.length}
                  </span>
                </div>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
            <p className="font-semibold">Resumen detallado de la configuración a guardar</p>
          </TooltipContent>
        </Tooltip>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t-2 border-gray-200 dark:border-gray-800">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onBack}
                disabled={isSaving}
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
                onClick={handleConfirm}
                disabled={isSaving || selectedGrades.length === 0}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px] h-12 text-base font-bold shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/40 border-2 border-emerald-700 dark:border-emerald-500 transition-all"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2.5} />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" strokeWidth={2.5} />
                    Guardar Configuración
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
              <p className="font-semibold">
                {selectedGrades.length === 0
                  ? 'Selecciona al menos un grado primero'
                  : 'Guardar la configuración de ciclo-grados en el sistema'}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
