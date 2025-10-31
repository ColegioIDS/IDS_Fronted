// src/components/features/sections/SectionStatsDialog.tsx

'use client';

import React from 'react';
import { BarChart3, Users, User, BookOpen, Calendar, TrendingUp, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useSectionStats } from '@/hooks/data/useSectionStats';

interface SectionStatsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionId: number | null;
  sectionName?: string;
}

/**
 * 📊 Diálogo de estadísticas detalladas de sección
 */
export function SectionStatsDialog({
  open,
  onOpenChange,
  sectionId,
  sectionName,
}: SectionStatsDialogProps) {
  const { data: stats, isLoading, error } = useSectionStats(sectionId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            Estadísticas de Sección
          </DialogTitle>
          {sectionName && (
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              {sectionName}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Loading state */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600 dark:text-purple-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Cargando estadísticas...
              </p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
              <p className="text-sm font-medium text-red-700 dark:text-red-300">
                Error al cargar estadísticas
              </p>
            </div>
          )}

          {/* Stats content */}
          {stats && !isLoading && (
            <>
              {/* Capacidad y utilización */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Capacidad y Utilización
                </h3>

                <div className="grid grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">
                      Capacidad
                    </p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {stats.capacity}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium mb-1">
                      Inscritos
                    </p>
                    <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                      {stats.currentEnrollments}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800">
                    <p className="text-xs text-purple-700 dark:text-purple-300 font-medium mb-1">
                      Disponibles
                    </p>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {stats.availableSpots}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
                    <p className="text-xs text-amber-700 dark:text-amber-300 font-medium mb-1 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Utilización
                    </p>
                    <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                      {stats.utilizationPercentage}%
                    </p>
                  </div>
                </div>

                {/* Barra de utilización detallada */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      Estado de utilización
                    </span>
                    <Badge 
                      className={
                        stats.utilizationPercentage >= 90 ? 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-700' :
                        stats.utilizationPercentage >= 75 ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700' :
                        stats.utilizationPercentage >= 50 ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-700' :
                        'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700'
                      }
                    >
                      {stats.utilizationPercentage >= 90 ? 'Llena' :
                       stats.utilizationPercentage >= 75 ? 'Alta' :
                       stats.utilizationPercentage >= 50 ? 'Media' :
                       'Baja'}
                    </Badge>
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        stats.utilizationPercentage >= 90 ? 'bg-red-500 dark:bg-red-400' :
                        stats.utilizationPercentage >= 75 ? 'bg-amber-500 dark:bg-amber-400' :
                        stats.utilizationPercentage >= 50 ? 'bg-blue-500 dark:bg-blue-400' :
                        'bg-emerald-500 dark:bg-emerald-400'
                      }`}
                      style={{ width: `${stats.utilizationPercentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                    {stats.currentEnrollments} de {stats.capacity} espacios ocupados
                  </p>
                </div>
              </div>

              <Separator />

              {/* Profesor */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
                  <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Profesor
                </h3>

                {stats.hasTeacher ? (
                  <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 border-2 border-emerald-300 dark:border-emerald-700">
                        <User className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                          {stats.teacher?.givenNames} {stats.teacher?.lastNames}
                        </p>
                        <Badge className="mt-1 bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700">
                          Profesor asignado
                        </Badge>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-300 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      No hay profesor asignado
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Cursos y horarios */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                  Cursos y Horarios
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 border-2 border-blue-300 dark:border-blue-700">
                        <BookOpen className="h-5 w-5 text-blue-700 dark:text-blue-300" />
                      </div>
                      <div>
                        <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                          Cursos Asignados
                        </p>
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                          {stats.totalCourseAssignments}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 border-2 border-purple-300 dark:border-purple-700">
                        <Calendar className="h-5 w-5 text-purple-700 dark:text-purple-300" />
                      </div>
                      <div>
                        <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                          Horarios
                        </p>
                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                          {stats.totalSchedules}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
