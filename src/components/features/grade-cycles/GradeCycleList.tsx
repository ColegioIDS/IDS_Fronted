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
} from 'lucide-react';
import { gradeCyclesService } from '@/services/grade-cycles.service';
import type { AvailableCycle, AvailableGrade } from '@/types/grade-cycles.types';
import { getModuleTheme, getStatusTheme } from '@/config/theme.config';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface GradeCycleListProps {
  onCreateNew: () => void;
}

interface CycleWithGrades extends AvailableCycle {
  grades: AvailableGrade[];
}

export function GradeCycleList({ onCreateNew }: GradeCycleListProps) {
  const [cycles, setCycles] = useState<CycleWithGrades[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const moduleTheme = getModuleTheme('gradeCycle');
  const activeTheme = getStatusTheme('active');

  const loadData = async () => {
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
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Error al cargar datos');
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
    } catch (err: any) {
      alert(err.message || 'Error al eliminar');
      console.error('Error deleting:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className={`p-4 rounded-2xl ${moduleTheme.bg}`}>
          <Loader2 className={`w-12 h-12 animate-spin ${moduleTheme.icon}`} />
        </div>
        <p className="text-gray-600 dark:text-gray-400 font-medium">Cargando configuraciones...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="border-2 border-red-200 dark:border-red-900/50 shadow-lg overflow-hidden">
        <div className="absolute inset-0 bg-red-50/50 dark:bg-red-950/10" />
        <CardContent className="relative py-16 text-center">
          <div className="inline-flex p-4 rounded-2xl bg-red-100 dark:bg-red-950/40 mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-red-700 dark:text-red-300 font-semibold mb-2 text-lg">{error}</p>
          <p className="text-red-600 dark:text-red-400 text-sm mb-6">
            Algo salió mal al cargar los ciclos
          </p>
          <Button 
            onClick={loadData} 
            variant="outline" 
            className="gap-2 border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Principal */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-3 rounded-xl ${moduleTheme.bg}`}>
                <Calendar className={`w-6 h-6 ${moduleTheme.icon}`} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Ciclos Configurados
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 ml-12">
              Administra los ciclos académicos y sus grados asignados
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={loadData}
              variant="outline"
              size="sm"
              className="gap-2 border-lime-300 dark:border-lime-800 hover:bg-lime-50 dark:hover:bg-lime-950/30"
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </Button>
            <Button
              onClick={onCreateNew}
              size="sm"
              className={`gap-2 text-white font-semibold ${moduleTheme.bg} hover:opacity-90 transition-all`}
            >
              <Plus className="w-5 h-5" />
              Nuevo Ciclo
            </Button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className={`p-4 rounded-lg border ${moduleTheme.border} ${moduleTheme.bg}`}>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide">Total Ciclos</p>
            <p className={`text-2xl font-bold ${moduleTheme.text} mt-1`}>{cycles.length}</p>
          </div>
          <div className={`p-4 rounded-lg border ${activeTheme.border} ${activeTheme.bg}`}>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide">Activos</p>
            <p className={`text-2xl font-bold ${activeTheme.text} mt-1`}>
              {cycles.filter(c => c.isActive).length}
            </p>
          </div>
          <div className="p-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide">Inscripción</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">
              {cycles.filter(c => c.canEnroll).length}
            </p>
          </div>
          <div className="p-4 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide">Grados Total</p>
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-300 mt-1">
              {cycles.reduce((sum, c) => sum + c.grades.length, 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {cycles.length === 0 ? (
        <Card className="border-2 border-dashed border-lime-300 dark:border-lime-800 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="py-20 text-center">
            <div className={`inline-flex p-5 rounded-2xl ${moduleTheme.bg} mb-4`}>
              <Calendar className={`w-10 h-10 ${moduleTheme.icon}`} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Sin ciclos configurados
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
              Crea tu primer ciclo académico para comenzar a asignar grados y gestionar el año escolar
            </p>
            <Button 
              onClick={onCreateNew} 
              className={`gap-2 text-white font-semibold ${moduleTheme.bg} hover:opacity-90`}
            >
              <Plus className="w-5 h-5" />
              Crear Primer Ciclo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5">
          {cycles.map((cycle) => (
            <Card
              key={cycle.id}
              className={`border-2 ${moduleTheme.border} hover:border-lime-400 dark:hover:border-lime-600 transition-all hover:shadow-lg overflow-hidden group`}
            >
              {/* Header with gradient background */}
              <CardHeader className={`${moduleTheme.bg} border-b-2 ${moduleTheme.border} pb-4`}>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2.5 rounded-lg ${moduleTheme.bg} border-2 ${moduleTheme.border} group-hover:scale-110 transition-transform`}>
                        <Calendar className={`w-5 h-5 ${moduleTheme.icon}`} />
                      </div>
                      <div>
                        <CardTitle className={`text-xl font-bold ${moduleTheme.text}`}>
                          {cycle.name}
                        </CardTitle>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          <Clock className="w-3.5 h-3.5" />
                          {format(new Date(cycle.startDate), 'dd MMM', { locale: es })} →{' '}
                          {format(new Date(cycle.endDate), 'dd MMM yyyy', { locale: es })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex gap-2 flex-wrap justify-end">
                    {cycle.isActive && (
                      <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 mr-1.5" />
                        Activo
                      </Badge>
                    )}
                    {cycle.canEnroll && (
                      <Badge className="bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-700 font-semibold">
                        <BookOpen className="w-3 h-3 mr-1.5" />
                        Inscripción
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              {/* Content */}
              <CardContent className="p-6 bg-white dark:bg-gray-950">
                {cycle.grades.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <div className={`inline-flex p-4 rounded-2xl ${moduleTheme.bg} mb-3`}>
                      <GraduationCap className={`w-8 h-8 ${moduleTheme.icon}`} />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                      Sin grados asignados a este ciclo
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <GraduationCap className={`w-4 h-4 ${moduleTheme.icon}`} />
                        Grados Asignados
                        <Badge className={`${moduleTheme.bg} ${moduleTheme.text} border ${moduleTheme.border} ml-2`}>
                          {cycle.grades.length}
                        </Badge>
                      </p>
                    </div>

                    {/* Grades Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {cycle.grades
                        .sort((a, b) => a.order - b.order)
                        .map((grade) => {
                          const deleteId = `${cycle.id}-${grade.id}`;
                          const isDeleting = deletingId === deleteId;

                          return (
                            <div
                              key={grade.id}
                              className={`flex items-center justify-between ${moduleTheme.bg} border-2 ${moduleTheme.border} rounded-lg p-4 transition-all hover:${moduleTheme.bgHover} group/item`}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className={`p-2 rounded-lg ${moduleTheme.bg} border ${moduleTheme.border}`}>
                                  <GraduationCap className={`w-4 h-4 ${moduleTheme.icon}`} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                    {grade.name}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Nivel: {grade.level}
                                  </p>
                                </div>
                              </div>

                              {/* Delete Button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(cycle.id, grade.id, grade.name)}
                                disabled={isDeleting}
                                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 ml-2 flex-shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity"
                              >
                                {isDeleting ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
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
  );
}