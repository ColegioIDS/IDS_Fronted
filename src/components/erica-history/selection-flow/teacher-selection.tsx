// src/components/erica-history/selection-flow/teacher-selection.tsx
"use client";

import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User2, CheckCircle, BookOpen, GraduationCap, Clock } from 'lucide-react';

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
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-600"></div>
          Cargando profesores con historial en la sección {selectedSection.name}...
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
          Seleccione el profesor para consultar su historial de evaluaciones en la sección {selectedSection.name}
        </p>
        <Badge variant="outline" className="text-xs">
          {availableTeachers.length} profesor{availableTeachers.length !== 1 ? 'es' : ''} con historial
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableTeachers.map(({ teacher, assignments, courseCount, isHomeroom }) => (
          <Card 
            key={teacher.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-2 ${
              isHomeroom 
                ? 'border-cyan-200 dark:border-cyan-800 bg-cyan-50/50 dark:bg-cyan-950/30'
                : 'border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/30'
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
                      ? 'text-cyan-600 dark:text-cyan-400 group-hover:text-cyan-700 dark:group-hover:text-cyan-300'
                      : 'text-teal-600 dark:text-teal-400 group-hover:text-teal-700 dark:group-hover:text-teal-300'
                  }`} />
                  <div className="flex flex-col gap-1">
                    {isHomeroom && (
                      <Badge 
                        variant="secondary" 
                        className="bg-cyan-100 dark:bg-cyan-900/50 text-cyan-800 dark:text-cyan-200 text-xs"
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
                        ? 'group-hover:text-cyan-900 dark:group-hover:text-cyan-100'
                        : 'group-hover:text-teal-900 dark:group-hover:text-teal-100'
                    }`}>
                      {teacher.givenNames} {teacher.lastNames}
                    </h3>
                  </div>

                  {/* Lista de cursos asignados */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <BookOpen className="h-3 w-3" />
                      <span>Cursos con historial:</span>
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

                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="h-3 w-3" />
                    <span>Consultar evaluaciones históricas</span>
                  </div>
                </div>

                <div className={`mt-4 pt-3 border-t transition-colors ${
                  isHomeroom
                    ? 'border-cyan-200 dark:border-cyan-700'
                    : 'border-teal-200 dark:border-teal-700'
                }`}>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Click para consultar</span>
                    <span>→</span>
                  </div>
                </div>
              </button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info adicional */}
      <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-cyan-600 dark:text-cyan-400 mt-0.5" />
          <div className="text-sm">
            <div className="font-medium text-cyan-800 dark:text-cyan-200 mb-2">
              Historial de evaluaciones por profesor:
            </div>
            <div className="space-y-1 text-cyan-700 dark:text-cyan-300">
              <div>• Visualice todas las evaluaciones ERICA realizadas</div>
              <div>• Consulte estadísticas y promedios por competencias</div>
              <div>• Analice progreso y tendencias de evaluación</div>
              <div>• Compare rendimiento entre diferentes períodos</div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6 space-y-1">
        <div>Solo se muestran los profesores con asignaciones en esta sección</div>
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
            <span>Maestro guía de la sección</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
            <span>Maestro de curso</span>
          </div>
        </div>
      </div>
    </div>
  );
}