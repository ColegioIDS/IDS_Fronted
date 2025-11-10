// src/components/features/attendance/components/attendance-controls/CourseSelector.tsx

'use client';

import { useState, useEffect } from 'react';
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
      <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
        ⚠️ Error al cargar cursos: {error.message}
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
    <div className="border-b border-gray-200 bg-blue-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">
            📚 Seleccionar Cursos ({selectedCourseIds.length}/{courses.length})
          </h3>
          <p className="text-xs text-gray-600">
            {selectedCourseIds.length === 0
              ? 'Selecciona uno o más cursos para registrar asistencia en múltiples clases'
              : `Registrarás asistencia en ${selectedCourseIds.length} curso${selectedCourseIds.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-blue-600 hover:text-blue-800"
          aria-label={expanded ? 'Contraer' : 'Expandir'}
        >
          {expanded ? '▼' : '▶'}
        </button>
      </div>

      {expanded && (
        <div className="space-y-2">
          {/* Botones de control */}
          <div className="flex gap-2 pb-3">
            <button
              type="button"
              onClick={toggleSelectAll}
              disabled={disabled}
              className="inline-flex items-center gap-1 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {allSelected ? '☑️' : someSelected ? '☐' : '☐'} Todos
            </button>
            {selectedCourseIds.length > 0 && (
              <button
                type="button"
                onClick={() => onSelectionChange([])}
                disabled={disabled}
                className="inline-flex items-center gap-1 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ✕ Limpiar
              </button>
            )}
          </div>

          {/* Lista de cursos */}
          <div className="grid gap-2">
            {courses.map(course => (
              <label
                key={course.id}
                className="flex cursor-pointer items-start gap-3 rounded-md border border-gray-200 bg-white p-2.5 hover:border-blue-300 hover:bg-blue-50"
              >
                <input
                  type="checkbox"
                  checked={selectedCourseIds.includes(course.id)}
                  onChange={() => toggleCourse(course.id)}
                  disabled={disabled}
                  className="mt-1 h-4 w-4 cursor-pointer rounded border-gray-300"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {course.color && (
                      <div
                        className="h-3 w-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: course.color }}
                        title="Color del curso"
                      />
                    )}
                    <span className="font-medium text-gray-900">{course.name}</span>
                    <span className="text-xs font-mono text-gray-500">({course.code})</span>
                  </div>
                  <div className="mt-1 text-xs text-gray-600">
                    {course.startTime && course.endTime && (
                      <span>🕐 {course.startTime} - {course.endTime}</span>
                    )}
                    {course.teacherName && (
                      <span className="ml-2">👨‍🏫 {course.teacherName}</span>
                    )}
                  </div>
                </div>
              </label>
            ))}
          </div>

          {/* Información útil */}
          {selectedCourseIds.length > 0 && (
            <div className="mt-3 rounded-md bg-blue-100 p-2 text-xs text-blue-800">
              ℹ️ Se registrará asistencia para <strong>{selectedCourseIds.length}</strong> curso
              {selectedCourseIds.length !== 1 ? 's' : ''} de cada estudiante seleccionado.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
