// src/components/features/attendance/components/attendance-controls/CourseSelector.tsx

'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, AlertCircle, Check, X, Clock, User, Info } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { AttendanceCourse } from '@/types/attendance.types';
import { useAttendanceCourses } from '@/hooks/attendance/useAttendanceCourses';

interface CourseSelectorProps {
  sectionId?: number;
  selectedCourseIds: number[];
  onSelectionChange: (courseIds: number[]) => void;
  disabled?: boolean;
}

/**
 * Componente para seleccionar múltiples cursos
 * Muestra cursos disponibles con información de horario y maestro
 */
export function CourseSelector({
  sectionId,
  selectedCourseIds,
  onSelectionChange,
  disabled = false,
}: CourseSelectorProps) {
  const { courses, loading, error } = useAttendanceCourses(sectionId);
  const [expanded, setExpanded] = useState(false);

  const toggleCourse = (courseId: number) => {
    if (selectedCourseIds.includes(courseId)) {
      onSelectionChange(selectedCourseIds.filter(id => id !== courseId));
    } else {
      onSelectionChange([...selectedCourseIds, courseId]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedCourseIds.length === courses.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(courses.map(course => course.id));
    }
  };

  if (!sectionId) {
    return null;
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 flex items-center gap-2">
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        <span>Error al cargar cursos: {error.message}</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-lg bg-gray-50 p-3">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <span className="text-sm text-gray-600">Cargando cursos...</span>
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return null;
  }

  const allSelected = selectedCourseIds.length === courses.length;
  const someSelected = selectedCourseIds.length > 0 && selectedCourseIds.length < courses.length;

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-4 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
              Seleccionar Cursos
            </h3>
            <span className="inline-flex items-center justify-center bg-blue-600 dark:bg-blue-500 text-white text-xs font-bold rounded-full h-6 w-6">
              {selectedCourseIds.length}/{courses.length}
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {selectedCourseIds.length === 0
              ? 'Selecciona uno o más cursos para registrar asistencia en múltiples clases'
              : `Registrarás asistencia en ${selectedCourseIds.length} curso${selectedCourseIds.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="ml-4 p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label={expanded ? 'Contraer' : 'Expandir'}
        >
          {expanded ? <ChevronDown className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-3">
          {/* Botones de control */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={toggleSelectAll}
              disabled={disabled}
              className="inline-flex items-center gap-2 rounded-lg bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              {allSelected ? <Check className="h-4 w-4 text-green-600 dark:text-green-400" /> : <X className="h-4 w-4 text-gray-400 dark:text-gray-500" />}
              Todos
            </button>
            {selectedCourseIds.length > 0 && (
              <button
                type="button"
                onClick={() => onSelectionChange([])}
                disabled={disabled}
                className="inline-flex items-center gap-2 rounded-lg bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                Limpiar
              </button>
            )}
          </div>

          {/* Grid de cursos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {courses.map(course => {
              const isSelected = selectedCourseIds.includes(course.id);
              const courseColor = course.color || '#d1d5db'; // Gris claro por defecto
              
              return (
                <div
                  key={course.id}
                  onClick={() => toggleCourse(course.id)}
                  className={`flex flex-col cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-all group ${
                    isSelected
                      ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-start gap-3 w-full">
                    <Checkbox
                      checked={selectedCourseIds.includes(course.id)}
                      onCheckedChange={() => toggleCourse(course.id)}
                      disabled={disabled}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      {/* Nombre y código */}
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={`h-5 w-5 rounded-full flex-shrink-0 ring-2 transition-all ${
                            isSelected 
                              ? 'ring-blue-400 dark:ring-blue-300 scale-110' 
                              : 'ring-offset-1 dark:ring-offset-gray-800 ring-gray-200 dark:ring-gray-600'
                          }`}
                          style={{ backgroundColor: courseColor }}
                          title="Color del curso"
                        />
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold truncate transition-colors ${
                            isSelected
                              ? 'text-blue-900 dark:text-blue-100'
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {course.name}
                          </p>
                          <p className="text-xs font-mono text-gray-500 dark:text-gray-400">
                            {course.code}
                          </p>
                        </div>
                      </div>

                      {/* Detalles */}
                      <div className="space-y-1.5">
                        {course.startTime && course.endTime && (
                          <div className={`flex items-center gap-2 text-xs transition-colors ${
                            isSelected
                              ? 'text-blue-700 dark:text-blue-300'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            <Clock className={`h-3.5 w-3.5 flex-shrink-0 ${
                              isSelected
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-blue-500 dark:text-blue-400'
                            }`} />
                            <span>{course.startTime} - {course.endTime}</span>
                          </div>
                        )}
                        {course.teacherName && (
                          <div className={`flex items-center gap-2 text-xs transition-colors ${
                            isSelected
                              ? 'text-blue-700 dark:text-blue-300'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            <User className={`h-3.5 w-3.5 flex-shrink-0 ${
                              isSelected
                                ? 'text-purple-600 dark:text-purple-400'
                                : 'text-purple-500 dark:text-purple-400'
                            }`} />
                            <span className="truncate">{course.teacherName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Información útil */}
          {selectedCourseIds.length > 0 && (
            <div className="mt-3 flex items-start gap-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 p-3">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-blue-900 dark:text-blue-200">
                Se registrará asistencia para <strong>{selectedCourseIds.length}</strong> curso
                {selectedCourseIds.length !== 1 ? 's' : ''} de cada estudiante seleccionado.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
