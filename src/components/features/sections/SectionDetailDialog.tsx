// src/components/features/sections/SectionDetailDialog.tsx

'use client';

import React from 'react';
import { Users, User, BookOpen, Hash, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Section } from '@/types/sections.types';

interface SectionDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section: Section | null;
}

/**
 * 📋 Diálogo de detalles de sección
 */
export function SectionDetailDialog({
  open,
  onOpenChange,
  section,
}: SectionDetailDialogProps) {
  if (!section) return null;

  const enrollments = section._count?.enrollments || 0;
  const utilization = section.capacity > 0 
    ? Math.round((enrollments / section.capacity) * 100) 
    : 0;
  const availableSpots = section.capacity - enrollments;
  const hasTeacher = !!section.teacherId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Sección {section.name}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Información completa de la sección
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Información básica */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">
              Información Básica
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Nombre */}
              <div className="space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Nombre
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {section.name}
                </p>
              </div>

              {/* Grado */}
              {section.grade && (
                <div className="space-y-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    Grado
                  </p>
                  <div>
                    <p className="text-base font-bold text-gray-900 dark:text-white">
                      {section.grade.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {section.grade.level}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Capacidad */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">
              Capacidad y Utilización
            </h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-1">
                  Capacidad Total
                </p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {section.capacity}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
                <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium mb-1">
                  Inscritos
                </p>
                <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                  {enrollments}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-purple-700 dark:text-purple-300 font-medium mb-1">
                  Disponibles
                </p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {availableSpots}
                </p>
              </div>
            </div>

            {/* Barra de utilización */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-400">
                <span>Utilización</span>
                <span className="font-bold">{utilization}%</span>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${
                    utilization >= 90 ? 'bg-red-500 dark:bg-red-400' :
                    utilization >= 75 ? 'bg-amber-500 dark:bg-amber-400' :
                    utilization >= 50 ? 'bg-blue-500 dark:bg-blue-400' :
                    'bg-emerald-500 dark:bg-emerald-400'
                  }`}
                  style={{ width: `${utilization}%` }}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Profesor asignado */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">
              Profesor Asignado
            </h3>
            
            {hasTeacher && section.teacher ? (
              <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 border-2 border-emerald-300 dark:border-emerald-700">
                    <User className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {section.teacher.givenNames} {section.teacher.lastNames}
                    </p>
                    {section.teacher.email && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {section.teacher.email}
                      </p>
                    )}
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700">
                    Asignado
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-amber-700 dark:text-amber-300" />
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                    No hay profesor asignado a esta sección
                  </p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Estadísticas adicionales */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">
              Estadísticas
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    Cursos Asignados
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {section._count?.courseAssignments || 0}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    Horarios
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {section._count?.schedules || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
