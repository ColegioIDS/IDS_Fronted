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
  Plus
} from 'lucide-react';
import { gradeCyclesService } from '@/services/grade-cycles.service';
import type { AvailableCycle, AvailableGrade } from '@/types/grade-cycles.types';
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

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Cargar todos los ciclos
      const allCycles = await gradeCyclesService.getAvailableCycles();

      // Para cada ciclo, cargar sus grados asignados
      const cyclesWithGrades = await Promise.all(
        allCycles.map(async (cycle) => {
          try {
            const relations = await gradeCyclesService.getGradesByCycle(cycle.id);
            // Los relations tienen { cycleId, gradeId, grade: {...} }
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
      
      // Actualizar UI localmente
      setCycles(prevCycles =>
        prevCycles.map(cycle =>
          cycle.id === cycleId
            ? { ...cycle, grades: cycle.grades.filter(g => g.id !== gradeId) }
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-lime-600 dark:text-lime-500" />
        <p className="text-gray-600 dark:text-gray-400">Cargando configuraciones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-2 border-red-200 dark:border-red-800">
        <CardContent className="py-12 text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
          <p className="text-red-800 dark:text-red-300 font-semibold mb-4">{error}</p>
          <Button onClick={loadData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Configuraciones Actuales
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {cycles.length} ciclo{cycles.length !== 1 ? 's' : ''} configurado{cycles.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={loadData}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </Button>
          <Button
            onClick={onCreateNew}
            size="sm"
            className="gap-2 bg-lime-600 hover:bg-lime-700 text-white dark:bg-lime-600 dark:hover:bg-lime-700"
          >
            <Plus className="w-4 h-4" />
            Configurar Nuevo Ciclo
          </Button>
        </div>
      </div>

      {/* Lista de ciclos */}
      {cycles.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-300 dark:border-gray-700">
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No hay ciclos configurados todavía
            </p>
            <Button onClick={onCreateNew} className="gap-2">
              <Plus className="w-4 h-4" />
              Configurar Primer Ciclo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {cycles.map((cycle) => (
            <Card
              key={cycle.id}
              className="border-2 border-gray-200 dark:border-gray-800 hover:border-lime-300 dark:hover:border-lime-700 transition-colors"
            >
              <CardHeader className="bg-gradient-to-r from-lime-50 to-lime-100 dark:from-lime-950/30 dark:to-lime-900/20 border-b-2 border-lime-200 dark:border-lime-800">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-lime-600 dark:text-lime-500" />
                      {cycle.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {format(new Date(cycle.startDate), 'dd MMM yyyy', { locale: es })} -{' '}
                      {format(new Date(cycle.endDate), 'dd MMM yyyy', { locale: es })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {cycle.isActive && (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700">
                        Activo
                      </Badge>
                    )}
                    {cycle.canEnroll && (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-700">
                        Inscripción
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {cycle.grades.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <GraduationCap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Sin grados asignados</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Grados asignados ({cycle.grades.length}):
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {cycle.grades
                        .sort((a, b) => a.order - b.order)
                        .map((grade) => {
                          const deleteId = `${cycle.id}-${grade.id}`;
                          const isDeleting = deletingId === deleteId;

                          return (
                            <div
                              key={grade.id}
                              className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                              <div className="flex items-center gap-2 flex-1">
                                <GraduationCap className="w-4 h-4 text-lime-600 dark:text-lime-500" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {grade.name}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {grade.level}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(cycle.id, grade.id, grade.name)}
                                disabled={isDeleting}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
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
