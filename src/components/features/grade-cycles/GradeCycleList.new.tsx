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
  Clock
} from 'lucide-react';
import { gradeCyclesService } from '@/services/grade-cycles.service';
import type { AvailableGrade, AvailableCycle } from '@/types/grade-cycles.types';
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
              .filter(r => r.grade)
              .map(r => r.grade as AvailableGrade);
            
            return { ...cycle, grades };
          } catch (err) {
            console.error(`Error loading grades for cycle ${cycle.id}:`, err);
            return { ...cycle, grades: [] };
          }
        })
      );

      setCycles(cyclesWithGrades);
      toast.success('Configuraciones cargadas correctamente');
    } catch (err: any) {
      console.error('Error loading data:', err);
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
      
      setCycles(prevCycles =>
        prevCycles.map(cycle =>
          cycle.id === deleteDialog.cycleId
            ? { ...cycle, grades: cycle.grades.filter(g => g.id !== deleteDialog.grade!.id) }
            : cycle
        )
      );

      toast.success(`Grado "${deleteDialog.grade.name}" eliminado correctamente`);
      setDeleteDialog({ open: false, cycleId: 0, cycleName: '', grade: null });
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar el grado');
      console.error('Error deleting:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-2">
        <CardContent className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="relative">
            <Loader2 className="w-12 h-12 animate-spin text-lime-600 dark:text-lime-500" />
            <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-lime-200 dark:border-lime-900" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-900 dark:text-white">Cargando configuraciones</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Por favor espera...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-2 border-red-200 dark:border-red-800">
        <CardContent className="py-12">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/30">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Error al cargar datos
              </h3>
              <p className="text-red-800 dark:text-red-300">{error}</p>
            </div>
            <Button onClick={loadData} variant="outline" className="gap-2">
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
  const activeCycles = cycles.filter(c => c.isActive).length;

  return (
    <>
      <div className="space-y-6">
        {/* Header con estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Ciclos</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{cycles.length}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950/30">
                  <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ciclos Activos</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{activeCycles}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/30">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Grados Asignados</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{totalGrades}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-lime-100 dark:bg-lime-950/30">
                  <GraduationCap className="w-6 h-6 text-lime-600 dark:text-lime-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 bg-lime-50 dark:bg-lime-950/20 border-lime-200 dark:border-lime-800">
            <CardContent className="pt-6">
              <Button
                onClick={onCreateNew}
                className="w-full h-full min-h-[80px] bg-lime-600 hover:bg-lime-700 text-white dark:bg-lime-600 dark:hover:bg-lime-700 flex flex-col items-center justify-center gap-2"
              >
                <Plus className="w-6 h-6" />
                <span className="font-semibold">Configurar Ciclo</span>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Barra de acciones */}
        <Card className="border-2">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Configuraciones por Ciclo
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Gestiona los grados disponibles en cada ciclo escolar
                </p>
              </div>
              <Button
                onClick={loadData}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Actualizar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de ciclos */}
        {cycles.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-300 dark:border-gray-700">
            <CardContent className="py-16">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900">
                  <Package className="w-10 h-10 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No hay configuraciones
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-sm">
                    Comienza configurando los grados disponibles para cada ciclo escolar
                  </p>
                </div>
                <Button onClick={onCreateNew} className="gap-2 bg-lime-600 hover:bg-lime-700">
                  <Plus className="w-4 h-4" />
                  Configurar Primer Ciclo
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {cycles.map((cycle) => (
              <Card
                key={cycle.id}
                className="border-2 border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-200"
              >
                <CardHeader className="border-b-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-lime-100 dark:bg-lime-950/30 border-2 border-lime-200 dark:border-lime-800">
                        <Calendar className="w-7 h-7 text-lime-600 dark:text-lime-500" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {cycle.name}
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            <span>
                              {format(new Date(cycle.startDate), 'dd MMM yyyy', { locale: es })} -{' '}
                              {format(new Date(cycle.endDate), 'dd MMM yyyy', { locale: es })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <GraduationCap className="w-4 h-4" />
                            <span>{cycle.grades.length} grado{cycle.grades.length !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {cycle.isActive && (
                        <Badge className="bg-emerald-100 text-emerald-800 border-2 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 font-semibold">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Activo
                        </Badge>
                      )}
                      {cycle.canEnroll && (
                        <Badge className="bg-blue-100 text-blue-800 border-2 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 font-semibold">
                          <Users className="w-3 h-3 mr-1" />
                          Inscripción
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {cycle.grades.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-700" />
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Sin grados asignados
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Configura los grados disponibles para este ciclo
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                          Grados Configurados
                        </h4>
                        <span className="text-xs font-semibold text-lime-600 dark:text-lime-400 bg-lime-50 dark:bg-lime-950/30 px-2 py-1 rounded">
                          {cycle.grades.length} total
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {cycle.grades
                          .sort((a, b) => a.order - b.order)
                          .map((grade) => (
                            <div
                              key={grade.id}
                              className="group relative flex items-center justify-between bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:border-lime-300 dark:hover:border-lime-700 transition-all duration-200 hover:shadow-md"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-lime-100 dark:bg-lime-950/30 border border-lime-200 dark:border-lime-800">
                                  <GraduationCap className="w-5 h-5 text-lime-600 dark:text-lime-500" />
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
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 h-8 w-8 p-0"
                              >
                                <Trash2 className="w-4 h-4" />
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
        onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
        grade={deleteDialog.grade}
        cycleName={deleteDialog.cycleName}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </>
  );
}
