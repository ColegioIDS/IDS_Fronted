// src/components/features/sections/SectionDetailView.tsx

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  GraduationCap,
  UserCheck,
  Calendar,
  BookOpen,
  Clock,
  Pencil,
  X,
} from 'lucide-react';
import { Section } from '@/types/sections.types';

interface SectionDetailViewProps {
  section: Section;
  onEdit?: () => void;
  onClose?: () => void;
  canEdit?: boolean;
}

/**
 * Vista detallada de una sección
 */
export function SectionDetailView({
  section,
  onEdit,
  onClose,
  canEdit = true,
}: SectionDetailViewProps) {
  const enrollments = section._count?.enrollments || 0;
  const utilization = section.capacity > 0 
    ? Math.round((enrollments / section.capacity) * 100) 
    : 0;
  const availableSpots = section.capacity - enrollments;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-fuchsia-200 dark:border-fuchsia-800">
        <CardHeader className="bg-fuchsia-50 dark:bg-fuchsia-950/30 border-b-2 border-fuchsia-200 dark:border-fuchsia-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-fuchsia-100 dark:bg-fuchsia-900/50 border-2 border-fuchsia-300 dark:border-fuchsia-700 flex items-center justify-center">
                <Users className="w-8 h-8 text-fuchsia-700 dark:text-fuchsia-300" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
                  Sección {section.name}
                </CardTitle>
                {section.grade && (
                  <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                    {section.grade.name}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {canEdit && onEdit && (
                <Button
                  onClick={onEdit}
                  className="gap-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
                >
                  <Pencil className="w-4 h-4" />
                  Editar
                </Button>
              )}
              {onClose && (
                <Button variant="outline" onClick={onClose} className="gap-2">
                  <X className="w-4 h-4" />
                  Cerrar
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Capacidad */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-gray-900 dark:text-white">Capacidad</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Matriculados:</span>
                  <span className="font-bold text-blue-700 dark:text-blue-300">{enrollments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Capacidad:</span>
                  <span className="font-bold text-blue-700 dark:text-blue-300">{section.capacity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Disponibles:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">{availableSpots}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t-2 border-blue-200 dark:border-blue-800">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Utilización:</span>
                  <Badge
                    className={`text-sm font-bold ${
                      utilization >= 90
                        ? 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-700'
                        : utilization >= 75
                        ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700'
                    }`}
                  >
                    {utilization}%
                  </Badge>
                </div>
              </div>
            </div>

            {/* Profesor */}
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-gray-900 dark:text-white">Profesor Titular</h3>
              </div>
              {section.teacher ? (
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Nombre:</p>
                    <p className="font-bold text-emerald-700 dark:text-emerald-300">
                      {section.teacher.givenNames} {section.teacher.lastNames}
                    </p>
                  </div>
                  {section.teacher.email && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Email:</p>
                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        {section.teacher.email}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-500 italic">Sin profesor asignado</p>
              )}
            </div>

            {/* Grado */}
            {section.grade && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-200 dark:border-amber-800 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <GraduationCap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <h3 className="font-bold text-gray-900 dark:text-white">Grado</h3>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Nombre:</p>
                    <p className="font-bold text-amber-700 dark:text-amber-300">{section.grade.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Nivel:</p>
                    <Badge className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700">
                      {section.grade.level}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Estadísticas adicionales */}
            <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border-2 border-purple-200 dark:border-purple-800 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="font-bold text-gray-900 dark:text-white">Recursos</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Cursos asignados:</span>
                  <span className="font-bold text-purple-700 dark:text-purple-300">
                    {section._count?.courseAssignments || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Horarios:</span>
                  <span className="font-bold text-purple-700 dark:text-purple-300">
                    {section._count?.schedules || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
