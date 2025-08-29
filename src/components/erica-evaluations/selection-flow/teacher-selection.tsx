// src/components/erica-evaluations/selection-flow/teacher-selection.tsx
"use client";

import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User2, CheckCircle, BookOpen, GraduationCap } from 'lucide-react';

// Context hooks
import { useCourseAssignmentContext } from '@/context/CourseAssignmentContext';
import { useTeacherContext } from '@/context/TeacherContext';

// Types
import { Section } from '@/types/student';
import { User } from '@/types/user';

// ==================== INTERFACES ====================
interface TeacherSelectionProps {
  selectedSection: Section;
  selectedTeacher: User | null;
  onSelect: (teacher: User) => void;
  isCompleted: boolean;
  onEdit: () => void;
}

interface TeacherWithAssignments {
  teacher: User;
  assignments: any[];
  courseCount: number;
  isHomeroom: boolean;
}

// ==================== COMPONENTE PRINCIPAL ====================
export default function TeacherSelection({
  selectedSection,
  selectedTeacher,
  onSelect,
  isCompleted,
  onEdit
}: TeacherSelectionProps) {
  // ========== CONTEXTS ==========
  const { 
    state: { assignments: courseAssignments, loading: loadingAssignments, error: assignmentError }
  } = useCourseAssignmentContext();
  
  const { 
    state: { teachers: allTeachers, loading: loadingTeachers }
  } = useTeacherContext();

  // ========== COMPUTED VALUES ==========
  const availableTeachers = useMemo((): TeacherWithAssignments[] => {
    // Filtrar asignaciones de la sección seleccionada
    const sectionAssignments = courseAssignments.filter(
      (assignment: any) => assignment.sectionId === selectedSection.id
    );

    // Obtener IDs únicos de profesores
    const teacherIds = [...new Set(sectionAssignments.map((a: any) => a.teacherId))];

    // Crear array de profesores con sus asignaciones
    const teachersWithAssignments = teacherIds
      .map(teacherId => {
        const teacher = allTeachers.find((t: any) => t.id === teacherId);
        if (!teacher) return null;

        const teacherAssignments = sectionAssignments.filter((a: any) => a.teacherId === teacherId);
        const isHomeroom = selectedSection.teacherId === teacherId;

        return {
          teacher,
          assignments: teacherAssignments,
          courseCount: teacherAssignments.length,
          isHomeroom
        };
      })
      .filter(Boolean) as TeacherWithAssignments[];

    // Ordenar: primero maestro guía, luego por cantidad de cursos, luego alfabético
    return teachersWithAssignments.sort((a, b) => {
      if (a.isHomeroom && !b.isHomeroom) return -1;
      if (!a.isHomeroom && b.isHomeroom) return 1;
      if (a.courseCount !== b.courseCount) return b.courseCount - a.courseCount;
      return (a.teacher.lastNames || '').localeCompare(b.teacher.lastNames || '');
    });
  }, [courseAssignments, allTeachers, selectedSection.id, selectedSection.teacherId]);

  // ========== VISTA COMPLETADA ==========
  if (isCompleted && selectedTeacher) {
    const teacherInfo = availableTeachers.find(t => t.teacher.id === selectedTeacher.id);
    
    return (
      <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          <div>
            <div className="font-semibold text-green-800 dark:text-green-200">
              {selectedTeacher.givenNames} {selectedTeacher.lastNames}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">
              {teacherInfo?.isHomeroom ? 'Maestro guía' : 'Maestro de curso'} 
              {teacherInfo && ` • ${teacherInfo.courseCount} curso${teacherInfo.courseCount !== 1 ? 's' : ''}`}
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200">
            Profesor seleccionado
          </Badge>
        </div>
        <Button
          onClick={onEdit}
          variant="ghost"
          size="sm"
          className="text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200"
        >
          Cambiar
        </Button>
      </div>
    );
  }

  // ========== MANEJO DE ESTADOS ==========
  const isLoading = loadingAssignments || loadingTeachers;
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
          Cargando profesores asignados a la sección {selectedSection.name}...
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (assignmentError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Error al cargar las asignaciones de profesores: {assignmentError}
        </AlertDescription>
      </Alert>
    );
  }

  if (availableTeachers.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          No hay profesores asignados a la sección {selectedSection.name}. 
          Configure las asignaciones de cursos para esta sección antes de continuar.
        </AlertDescription>
      </Alert>
    );
  }

  // ========== VISTA DE SELECCIÓN ==========
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Seleccione el profesor para evaluar en la sección {selectedSection.name}
        </p>
        <Badge variant="outline" className="text-xs">
          {availableTeachers.length} profesor{availableTeachers.length !== 1 ? 'es' : ''} asignado{availableTeachers.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableTeachers.map(({ teacher, assignments, courseCount, isHomeroom }) => (
          <Card 
            key={teacher.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-2 ${
              isHomeroom 
                ? 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30'
                : 'border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/30'
            }`}
          >
            <CardContent className="p-6">
              <button
                onClick={() => onSelect(teacher)}
                className="w-full text-left group"
              >
                <div className="flex items-start justify-between mb-3">
                  <User2 className={`h-8 w-8 transition-colors ${
                    isHomeroom
                      ? 'text-amber-600 dark:text-amber-400 group-hover:text-amber-700 dark:group-hover:text-amber-300'
                      : 'text-orange-600 dark:text-orange-400 group-hover:text-orange-700 dark:group-hover:text-orange-300'
                  }`} />
                  <div className="flex flex-col gap-1">
                    {isHomeroom && (
                      <Badge 
                        variant="secondary" 
                        className="bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 text-xs"
                      >
                        Maestro Guía
                      </Badge>
                    )}
                    <Badge 
                      variant="outline" 
                      className="text-xs"
                    >
                      {courseCount} curso{courseCount !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h3 className={`font-semibold text-lg text-gray-900 dark:text-gray-100 transition-colors ${
                      isHomeroom
                        ? 'group-hover:text-amber-900 dark:group-hover:text-amber-100'
                        : 'group-hover:text-orange-900 dark:group-hover:text-orange-100'
                    }`}>
                      {teacher.givenNames} {teacher.lastNames}
                    </h3>
                  </div>

                  {/* Lista de cursos asignados */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <BookOpen className="h-3 w-3" />
                      <span>Cursos asignados:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {assignments.slice(0, 3).map((assignment: any) => (
                        <Badge 
                          key={assignment.id}
                          variant="outline" 
                          className="text-xs px-1 py-0"
                        >
                          {assignment.course?.name || assignment.course?.code || 'Curso'}
                        </Badge>
                      ))}
                      {assignments.length > 3 && (
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          +{assignments.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className={`mt-4 pt-3 border-t transition-colors ${
                  isHomeroom
                    ? 'border-amber-200 dark:border-amber-700'
                    : 'border-orange-200 dark:border-orange-700'
                }`}>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Click para seleccionar</span>
                    <span>→</span>
                  </div>
                </div>
              </button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info adicional */}
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6 space-y-1">
        <div>Solo se muestran los profesores con asignaciones en esta sección</div>
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
            <span>Maestro guía de la sección</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            <span>Maestro de curso</span>
          </div>
        </div>
      </div>
    </div>
  );
}