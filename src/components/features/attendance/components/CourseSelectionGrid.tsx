// src/components/features/attendance/components/CourseSelectionGrid.tsx
/**
 * Componente para seleccionar múltiples cursos del maestro
 * Diseño limpio, sin emojis, solo iconos
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Clock, MapPin, Users } from 'lucide-react';
import { TeacherCourse } from '@/types/attendance.types';

interface CourseSelectionGridProps {
  courses: TeacherCourse[];
  selectedCourseIds: number[];
  onSelectionChange: (courseIds: number[]) => void;
  isLoading?: boolean;
  maxSelection?: number; // Default: 10
}

export function CourseSelectionGrid({
  courses,
  selectedCourseIds,
  onSelectionChange,
  isLoading = false,
  maxSelection = 10,
}: CourseSelectionGridProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const handleToggleCourse = (courseId: number) => {
    if (isLoading) return;

    const isSelected = selectedCourseIds.includes(courseId);

    if (isSelected) {
      onSelectionChange(selectedCourseIds.filter((id) => id !== courseId));
    } else {
      // Validar límite
      if (selectedCourseIds.length >= maxSelection) {
        return;
      }
      onSelectionChange([...selectedCourseIds, courseId]);
    }
  };

  const isLimitReached = selectedCourseIds.length >= maxSelection;

  if (courses.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-900/30">
        <AlertCircle className="mx-auto mb-3 h-8 w-8 text-gray-400" />
        <p className="text-gray-600 dark:text-gray-400">No hay cursos disponibles para esta fecha</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con información */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Seleccionar Cursos</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {selectedCourseIds.length} de {maxSelection} cursos seleccionados
          </p>
        </div>
        {isLimitReached && (
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 dark:bg-amber-950/20">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Límite alcanzado</span>
          </div>
        )}
      </div>

      {/* Grid de cursos */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => {
          const isSelected = selectedCourseIds.includes(course.courseAssignmentId);
          const isDisabled = isLoading || (!isSelected && isLimitReached);

          return (
            <Card
              key={course.courseAssignmentId}
              className={`relative cursor-pointer transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/20'
                  : isDisabled
                    ? 'border-gray-200 bg-gray-100 opacity-50 dark:border-gray-700 dark:bg-gray-800'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 hover:dark:border-gray-600'
              }`}
              onMouseEnter={() => setHoveredId(course.courseAssignmentId)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => handleToggleCourse(course.courseAssignmentId)}
            >
              <CardContent className="p-4">
                {/* Checkbox en la esquina */}
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{course.courseName}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{course.courseCode}</p>
                  </div>
                  <Checkbox
                    checked={isSelected}
                    disabled={isDisabled}
                    onChange={() => handleToggleCourse(course.courseAssignmentId)}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1"
                  />
                </div>

                {/* Sección */}
                <div className="mb-3 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="inline-block h-2 w-2 rounded-full bg-gray-400"></span>
                  {course.sectionName}
                </div>

                {/* Información - Hora, aula, estudiantes */}
                <div className="space-y-2 border-t border-gray-200 pt-3 dark:border-gray-700">
                  {/* Horario */}
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {course.startTime} - {course.endTime}
                    </span>
                  </div>

                  {/* Aula */}
                  {course.classroom && (
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{course.classroom}</span>
                    </div>
                  )}

                  {/* Estudiantes */}
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <Users className="h-3.5 w-3.5" />
                    <span>{course.studentCount} estudiantes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Información adicional */}
      {selectedCourseIds.length > 0 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/20">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Se registrará asistencia para {selectedCourseIds.length} curso{selectedCourseIds.length !== 1 ? 's' : ''} y{' '}
            {courses
              .filter((c) => selectedCourseIds.includes(c.courseAssignmentId))
              .reduce((total, c) => total + c.studentCount, 0)}{' '}
            estudiantes en total
          </p>
        </div>
      )}
    </div>
  );
}
