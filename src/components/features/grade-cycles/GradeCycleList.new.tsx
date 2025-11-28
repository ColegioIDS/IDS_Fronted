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
  CheckCircle2,
  Package,
  BookOpen,
  Users,
  Clock,
  Zap,
  TrendingUp,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { gradeCyclesService } from '@/services/grade-cycles.service';
import type { AvailableGrade, AvailableCycle } from '@/types/grade-cycles.types';
import { getModuleTheme, getStatusTheme } from '@/config/theme.config';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { DeleteGradeDialog } from './DeleteGradeDialog';

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
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    cycleId: number;
    cycleName: string;
    grade: AvailableGrade | null;
  }>({
    open: false,
    cycleId: 0,
    cycleName: '',
    grade: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

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
            return { ...cycle, grades: [] };
          }
        })
      );

      setCycles(cyclesWithGrades);
      toast.success('Configuraciones cargadas correctamente');
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos');
      toast.error('Error al cargar configuraciones');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteClick = (cycleId: number, cycleName: string, grade: AvailableGrade) => {
    setDeleteDialog({
      open: true,
      cycleId,
      cycleName,
      grade,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.grade) return;

    try {
      setIsDeleting(true);
      await gradeCyclesService.delete(deleteDialog.cycleId, deleteDialog.grade.id);

      setCycles((prevCycles) =>
        prevCycles.map((cycle) =>
          cycle.id === deleteDialog.cycleId
            ? { ...cycle, grades: cycle.grades.filter((g) => g.id !== deleteDialog.grade!.id) }
            : cycle
        )
      );

      toast.success(`Grado "${deleteDialog.grade.name}" eliminado correctamente`);
      setDeleteDialog({ open: false, cycleId: 0, cycleName: '', grade: null });
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar el grado');
    } finally {
      setIsDeleting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className={`border-2 ${moduleTheme.border} shadow-lg`}>
        <CardContent className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className={`p-5 rounded-2xl ${moduleTheme.bg} animate-pulse`}>
            <Loader2 className={`w-10 h-10 animate-spin ${moduleTheme.icon}`} />
          </div>
          <div className="text-center space-y-2">
            <p className="font-semibold text-gray-900 dark:text-white text-lg">
              Cargando configuraciones
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Por favor espera...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="border-2 border-red-200 dark:border-red-900/50 shadow-lg">
        <CardContent className="py-16">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-950/40 border-2 border-red-200 dark:border-red-800">
              <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Error al cargar datos
              </h3>
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
            <Button 
              onClick={loadData} 
              variant="outline" 
              className="gap-2 mt-4 border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <RefreshCw className="w-4 h-4" />
              Intentar nuevamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calcular estadísticas
  const totalGrades = cycles.reduce((sum, cycle) => sum + cycle.grades.length, 0);
  const activeCycles = cycles.filter((c) => c.isActive).length;
  const enrollmentCycles = cycles.filter((c) => c.canEnroll).length;

  return (
    <>
      <div className="space-y-8">
        {/* Header Principal */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className={`p-4 rounded-2xl ${moduleTheme.bg} border-2 ${moduleTheme.border}`}>
                  <Sparkles className={`w-8 h-8 ${moduleTheme.icon}`} />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                    Ciclos Académicos
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Gestiona los ciclos y grados del sistema
                  </p>
                </div>
              </div>
            </div>
            <Button
              onClick={loadData}
              variant="outline"
              size="sm"
              className={`gap-2 border-2 ${moduleTheme.border} ${moduleTheme.text} hover:${moduleTheme.bg}`}
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Ciclos */}
            <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-md hover:shadow-lg transition-all hover:-translate-y-1 overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 dark:bg-blue-950/20 rounded-full -mr-10 -mt-10 opacity-50" />
              <CardContent className="pt-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">
                      Total Ciclos
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {cycles.length}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                      <TrendingUp className="w-3 h-3" />
                      <span>Vigentes</span>
                    </div>
                  </div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-950/40 border-2 border-blue-200 dark:border-blue-800">
                    <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ciclos Activos */}
            <Card className="border-2 border-emerald-200 dark:border-emerald-800 shadow-md hover:shadow-lg transition-all hover:-translate-y-1 overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-50 dark:bg-emerald-950/20 rounded-full -mr-10 -mt-10 opacity-50" />
              <CardContent className="pt-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">
                      Activos
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {activeCycles}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>En curso</span>
                    </div>
                  </div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 border-2 border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Grados Asignados */}
            <Card className={`border-2 ${moduleTheme.border} shadow-md hover:shadow-lg transition-all hover:-translate-y-1 overflow-hidden`}>
              <div className={`absolute top-0 right-0 w-20 h-20 ${moduleTheme.bg} rounded-full -mr-10 -mt-10 opacity-30`} />
              <CardContent className="pt-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">
                      Grados
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {totalGrades}
                    </p>
                    <div className={`flex items-center gap-1 mt-2 ${moduleTheme.text} text-xs font-semibold`}>
                      <BarChart3 className="w-3 h-3" />
                      <span>Configurados</span>
                    </div>
                  </div>
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${moduleTheme.bg} border-2 ${moduleTheme.border}`}>
                    <GraduationCap className={`w-8 h-8 ${moduleTheme.icon}`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inscripción */}
            <Card className="border-2 border-amber-200 dark:border-amber-800 shadow-md hover:shadow-lg transition-all hover:-translate-y-1 overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-amber-50 dark:bg-amber-950/20 rounded-full -mr-10 -mt-10 opacity-50" />
              <CardContent className="pt-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">
                      Inscripción
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {enrollmentCycles}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                      <Users className="w-3 h-3" />
                      <span>Abierta</span>
                    </div>
                  </div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950/40 border-2 border-amber-200 dark:border-amber-800">
                    <Users className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Lista de ciclos o Empty State */}
        {cycles.length === 0 ? (
          <Card className="border-2 border-dashed border-lime-300 dark:border-lime-800 shadow-md hover:shadow-lg transition-all">
            <CardContent className="py-20">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className={`flex h-24 w-24 items-center justify-center rounded-2xl ${moduleTheme.bg} border-2 ${moduleTheme.border}`}>
                  <Package className={`w-12 h-12 ${moduleTheme.icon}`} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    No hay ciclos configurados
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md">
                    Comienza configurando los grados disponibles para el primer ciclo escolar
                  </p>
                </div>
                <Button 
                  onClick={onCreateNew} 
                  className={`gap-2 text-white font-semibold px-6 py-6 text-base ${moduleTheme.bg} hover:opacity-90 transition-all`}
                >
                  <Plus className="w-5 h-5" />
                  Crear Primer Ciclo
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-5">
            {cycles.map((cycle) => (
              <Card
                key={cycle.id}
                className={`border-2 ${moduleTheme.border} hover:border-lime-400 dark:hover:border-lime-600 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group`}
              >
                {/* Card Header */}
                <CardHeader className={`${moduleTheme.bg} border-b-2 ${moduleTheme.border} pb-5`}>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    {/* Left side - Title and Info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${moduleTheme.bg} border-2 ${moduleTheme.border} group-hover:scale-110 transition-transform flex-shrink-0`}>
                        <Calendar className={`w-8 h-8 ${moduleTheme.icon}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className={`text-2xl font-bold ${moduleTheme.text} line-clamp-2`}>
                          {cycle.name}
                        </CardTitle>
                        <div className="space-y-2 mt-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Clock className="w-4 h-4 flex-shrink-0" />
                            <span>
                              {format(new Date(cycle.startDate), 'dd MMM yyyy', { locale: es })} →{' '}
                              {format(new Date(cycle.endDate), 'dd MMM yyyy', { locale: es })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <BookOpen className="w-4 h-4 flex-shrink-0" />
                            <span>
                              {cycle.grades.length} grado{cycle.grades.length !== 1 ? 's' : ''} configurado
                              {cycle.grades.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex gap-2 flex-wrap justify-start sm:justify-end">
                      {cycle.isActive && (
                        <Badge className="bg-emerald-100 text-emerald-800 border-2 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700 font-semibold px-3 py-1.5 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Activo
                        </Badge>
                      )}
                      {cycle.canEnroll && (
                        <Badge className="bg-blue-100 text-blue-800 border-2 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-700 font-semibold px-3 py-1.5 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />
                          Inscripción
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                {/* Card Content */}
                <CardContent className="p-6 bg-white dark:bg-gray-950">
                  {cycle.grades.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${moduleTheme.bg} mx-auto mb-4`}>
                        <BookOpen className={`w-7 h-7 ${moduleTheme.icon}`} />
                      </div>
                      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                        Sin grados asignados
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Configura los grados disponibles para este ciclo
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                            Grados Configurados
                          </h4>
                          <Badge className={`${moduleTheme.bg} ${moduleTheme.text} border-2 ${moduleTheme.border} font-bold`}>
                            {cycle.grades.length}
                          </Badge>
                        </div>
                      </div>

                      {/* Grades Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {cycle.grades
                          .sort((a, b) => a.order - b.order)
                          .map((grade) => (
                            <div
                              key={grade.id}
                              className={`group/grade flex items-center justify-between ${moduleTheme.bg} border-2 ${moduleTheme.border} rounded-xl p-4 transition-all hover:${moduleTheme.bgHover} hover:shadow-md hover:scale-105`}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${moduleTheme.bg} border-2 ${moduleTheme.border} flex-shrink-0`}>
                                  <GraduationCap className={`w-5 h-5 ${moduleTheme.icon}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                    {grade.name}
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                    {grade.level}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(cycle.id, cycle.name, grade)}
                                className="opacity-0 group-hover/grade:opacity-100 transition-opacity text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 h-9 w-9 p-0 ml-2 flex-shrink-0"
                              >
                                {isDeleting ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <DeleteGradeDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}
        grade={deleteDialog.grade}
        cycleName={deleteDialog.cycleName}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </>
  );
}