// src/components/features/grade-cycles/GradeCycleList.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Trash2,
  GraduationCap,
  Calendar,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Plus,
  BookOpen,
  Clock,
  CalendarDays,
  Layers,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { gradeCyclesService } from '@/services/grade-cycles.service';
import type { AvailableCycle, AvailableGrade } from '@/types/grade-cycles.types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';

interface GradeCycleListProps {
  onCreateNew: () => void;
}

interface CycleWithGrades extends AvailableCycle {
  grades: AvailableGrade[];
}

/**
 * 📋 Lista de configuraciones de ciclo-grados - Diseño moderno
 */
export function GradeCycleList({ onCreateNew }: GradeCycleListProps) {
  const [cycles, setCycles] = useState<CycleWithGrades[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = async (showToast = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const allCycles = await gradeCyclesService.getAvailableCycles();

      const cyclesWithGrades = await Promise.all(
        allCycles.map(async (cycle) => {
          try {
            const relations = await gradeCyclesService.getGradesByCycle(cycle.id);
            const grades = relations
              .filter((r) => r.grade)
              .map((r) => r.grade as AvailableGrade);

            return { ...cycle, grades };
          } catch (err) {
            console.error(`Error loading grades for cycle ${cycle.id}:`, err);
            return { ...cycle, grades: [] };
          }
        })
      );

      setCycles(cyclesWithGrades);

      if (showToast) {
        const totalGrades = cyclesWithGrades.reduce((sum, c) => sum + c.grades.length, 0);
        toast.success('Lista actualizada', {
          description: `${cyclesWithGrades.length} ciclos y ${totalGrades} grados cargados`,
          icon: <CheckCircle2 className="w-5 h-5" />,
          duration: 2000,
        });
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      const errorMessage = err.message || 'Error al cargar datos';
      setError(errorMessage);

      if (showToast) {
        toast.error('Error al cargar datos', {
          description: errorMessage,
          icon: <XCircle className="w-5 h-5" />,
          duration: 4000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (cycleId: number, gradeId: number, gradeName: string) => {
    if (!confirm(`¿Eliminar el grado "${gradeName}" de este ciclo?`)) {
      return;
    }

    const deleteId = `${cycleId}-${gradeId}`;
    const deletingToast = toast.loading('Eliminando grado...', {
      description: `Eliminando "${gradeName}" del ciclo`,
      icon: <Loader2 className="w-5 h-5 animate-spin" />,
    });

    try {
      setDeletingId(deleteId);
      await gradeCyclesService.delete(cycleId, gradeId);

      setCycles((prevCycles) =>
        prevCycles.map((cycle) =>
          cycle.id === cycleId
            ? { ...cycle, grades: cycle.grades.filter((g) => g.id !== gradeId) }
            : cycle
        )
      );

      toast.success('Grado eliminado exitosamente', {
        id: deletingToast,
        description: `"${gradeName}" ha sido eliminado del ciclo`,
        icon: <CheckCircle2 className="w-5 h-5" />,
        duration: 3000,
      });
    } catch (err: any) {
      const errorMessage = err.message || 'Error al eliminar';
      console.error('Error deleting:', err);

      toast.error('Error al eliminar grado', {
        id: deletingToast,
        description: errorMessage,
        icon: <XCircle className="w-5 h-5" />,
        duration: 4000,
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <TooltipProvider>
        <div className="flex flex-col items-center justify-center py-32 space-y-6">
          <div className="relative">
            <Loader2 className="w-16 h-16 animate-spin text-indigo-600 dark:text-indigo-500" strokeWidth={2.5} />
            <div className="absolute inset-0 w-16 h-16 rounded-full bg-indigo-500/20 animate-ping" />
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              Cargando configuraciones
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Por favor espera un momento...
            </p>
          </div>
        </div>
      </TooltipProvider>
    );
  }

  // Error state
  if (error) {
    return (
      <TooltipProvider>
        <Card className="border-2 border-red-200 dark:border-red-900/50 shadow-lg overflow-hidden">
          <CardContent className="py-20 text-center">
            <div className="inline-flex p-5 rounded-2xl bg-red-100 dark:bg-red-950/40 mb-5">
              <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-bold text-red-900 dark:text-red-300 mb-2">
              Error al Cargar
            </h3>
            <p className="text-red-700 dark:text-red-400 mb-8">{error}</p>
            <Button
              onClick={() => loadData(true)}
              variant="outline"
              className="gap-2 border-2 border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 h-12 px-6 font-semibold"
            >
              <RefreshCw className="w-5 h-5" strokeWidth={2.5} />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </TooltipProvider>
    );
  }

  const totalGrades = cycles.reduce((sum, c) => sum + c.grades.length, 0);
  const activeCycles = cycles.filter(c => c.isActive).length;
  const enrollCycles = cycles.filter(c => c.canEnroll).length;

  return (
    <TooltipProvider>
      <div className="space-y-8">
        {/* Header Principal */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 dark:bg-indigo-500 shadow-xl shadow-indigo-500/30">
                <CalendarDays className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Ciclos Configurados
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Administra los ciclos académicos y sus grados asignados
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => loadData(true)}
                    variant="outline"
                    className="gap-2 border-2 h-12 px-5 font-semibold"
                  >
                    <RefreshCw className="w-4 h-4" strokeWidth={2.5} />
                    Actualizar
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                  <p className="font-semibold">Recargar lista de ciclos</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={onCreateNew}
                    className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 h-12 px-6 font-bold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 border-2 border-indigo-700 dark:border-indigo-500 transition-all"
                  >
                    <Plus className="w-5 h-5" strokeWidth={2.5} />
                    Nuevo Ciclo
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                  <p className="font-semibold">Crear nueva configuración de ciclo-grados</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-5 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/20 hover:shadow-lg transition-shadow cursor-help">
                  <div className="flex items-center gap-3 mb-2">
                    <CalendarDays className="w-5 h-5 text-indigo-600 dark:text-indigo-500" strokeWidth={2.5} />
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Ciclos</p>
                  </div>
                  <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-400">{cycles.length}</p>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                <p className="font-semibold">Ciclos escolares configurados</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-5 rounded-xl border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 hover:shadow-lg transition-shadow cursor-help">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-500" strokeWidth={2.5} />
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Activos</p>
                  </div>
                  <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">{activeCycles}</p>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                <p className="font-semibold">Ciclos actualmente activos</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-5 rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 hover:shadow-lg transition-shadow cursor-help">
                  <div className="flex items-center gap-3 mb-2">
                    <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-500" strokeWidth={2.5} />
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Inscripción</p>
                  </div>
                  <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">{enrollCycles}</p>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                <p className="font-semibold">Con inscripción abierta</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-5 rounded-xl border-2 border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/20 hover:shadow-lg transition-shadow cursor-help">
                  <div className="flex items-center gap-3 mb-2">
                    <Layers className="w-5 h-5 text-violet-600 dark:text-violet-500" strokeWidth={2.5} />
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Grados Total</p>
                  </div>
                  <p className="text-3xl font-bold text-violet-700 dark:text-violet-400">{totalGrades}</p>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                <p className="font-semibold">Total de grados asignados</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Empty State */}
        {cycles.length === 0 ? (
          <Card className="border-2 border-dashed border-indigo-300 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/10 shadow-sm hover:shadow-xl transition-shadow">
            <CardContent className="py-24 text-center">
              <div className="inline-flex p-6 rounded-2xl bg-indigo-100 dark:bg-indigo-950/30 border-2 border-indigo-200 dark:border-indigo-800 mb-5">
                <CalendarDays className="w-14 h-14 text-indigo-600 dark:text-indigo-500" strokeWidth={2} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Sin ciclos configurados
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Crea tu primer ciclo académico para comenzar a asignar grados y gestionar el año escolar
              </p>
              <Button
                onClick={onCreateNew}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 h-12 px-8 text-base font-bold shadow-lg shadow-indigo-500/30 hover:shadow-xl border-2 border-indigo-700"
              >
                <Plus className="w-5 h-5" strokeWidth={2.5} />
                Crear Primer Ciclo
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {cycles.map((cycle) => (
              <Card
                key={cycle.id}
                className="border-2 border-gray-200 dark:border-gray-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all hover:shadow-2xl overflow-hidden group"
              >
                {/* Header */}
                <CardHeader className="bg-indigo-50 dark:bg-indigo-950/20 border-b-2 border-gray-200 dark:border-gray-800 pb-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-600 dark:bg-indigo-500 border-2 border-indigo-500 shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                          <Calendar className="w-7 h-7 text-white" strokeWidth={2.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                            {cycle.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Clock className="w-4 h-4" strokeWidth={2.5} />
                            <span className="font-medium">
                              {format(new Date(cycle.startDate), 'dd MMM', { locale: es })} →{' '}
                              {format(new Date(cycle.endDate), 'dd MMM yyyy', { locale: es })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex gap-2 flex-wrap">
                      {cycle.isActive && (
                        <Badge className="bg-emerald-100 text-emerald-800 border-2 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 font-bold px-3 py-1.5">
                          <div className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 mr-2 animate-pulse" />
                          Activo
                        </Badge>
                      )}
                      {cycle.canEnroll && (
                        <Badge className="bg-blue-100 text-blue-800 border-2 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 font-bold px-3 py-1.5">
                          <BookOpen className="w-3.5 h-3.5 mr-1.5" strokeWidth={2.5} />
                          Inscripción
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                {/* Content */}
                <CardContent className="p-8 bg-white dark:bg-gray-950">
                  {cycle.grades.length === 0 ? (
                    <div className="text-center py-12 px-4">
                      <div className="inline-flex p-4 rounded-2xl bg-gray-100 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 mb-4">
                        <GraduationCap className="w-10 h-10 text-gray-400 dark:text-gray-600" strokeWidth={2} />
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 font-medium">
                        Sin grados asignados a este ciclo
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-950/30 border-2 border-violet-200 dark:border-violet-800">
                            <GraduationCap className="w-6 h-6 text-violet-600 dark:text-violet-500" strokeWidth={2.5} />
                          </div>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            Grados Asignados
                          </p>
                        </div>
                        <Badge className="bg-violet-600 dark:bg-violet-500 text-white border-2 border-violet-700 dark:border-violet-600 font-bold px-4 py-1.5 text-base">
                          {cycle.grades.length}
                        </Badge>
                      </div>

                      {/* Grades Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {cycle.grades
                          .sort((a, b) => a.order - b.order)
                          .map((grade) => {
                            const deleteId = `${cycle.id}-${grade.id}`;
                            const isDeleting = deletingId === deleteId;

                            return (
                              <div
                                key={grade.id}
                                className="group/item flex items-center justify-between rounded-xl border-2 border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/20 p-4 hover:shadow-md transition-all"
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600 dark:bg-violet-500 flex-shrink-0">
                                    <GraduationCap className="w-5 h-5 text-white" strokeWidth={2.5} />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                      {grade.name}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                      {grade.level}
                                    </p>
                                  </div>
                                </div>

                                {/* Delete Button */}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDelete(cycle.id, grade.id, grade.name)}
                                      disabled={isDeleting}
                                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 ml-2 flex-shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity"
                                    >
                                      {isDeleting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} />
                                      ) : (
                                        <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                                    <p className="font-semibold">Eliminar {grade.name} de este ciclo</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
