// src/components/erica-evaluations/selection-flow/course-selection.tsx
"use client";

import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookOpen, User2, Users, Palette, AlertCircle, CheckCircle2 } from 'lucide-react';

// Contexts
import { useCourseAssignmentContext } from '@/context/CourseAssignmentContext';

// Types
import { User } from '@/types/user';
import { Section } from '@/types/student';
import { Course } from '@/types/courses';

// ==================== INTERFACES ====================
interface CourseSelectionProps {
  selectedTeacher: User;
  selectedSection: Section;
  selectedCourse: Course | null;
  onSelect: (course: Course) => void;
  isCompleted: boolean;
  onEdit: () => void;
}

interface CourseWithAssignment extends Course {
  assignmentType: 'titular' | 'specialist';
  assignmentId: number;
}

// ==================== COMPONENTE ====================
export default function CourseSelection({
  selectedTeacher,
  selectedSection,
  selectedCourse,
  onSelect,
  isCompleted,
  onEdit
}: CourseSelectionProps) {
  
  // ========== CONTEXTS ==========
  const { 
    state: { assignments: courseAssignments, loading: loadingAssignments }
  } = useCourseAssignmentContext();

  // ========== COMPUTED VALUES ==========
  
  // Filtrar cursos que enseña este profesor en esta sección
  const availableCourses = useMemo(() => {
    if (!courseAssignments || !selectedTeacher || !selectedSection) return [];
    
    const teacherAssignments = courseAssignments.filter(
      (assignment: any) => 
        assignment.teacherId === selectedTeacher.id &&
        assignment.sectionId === selectedSection.id &&
        assignment.isActive
    );

    return teacherAssignments.map((assignment: any): CourseWithAssignment => ({
      ...assignment.course,
      assignmentType: assignment.assignmentType,
      assignmentId: assignment.id
    }));
  }, [courseAssignments, selectedTeacher, selectedSection]);

  // Separar por tipo de asignación
  const { titularCourses, specialistCourses } = useMemo(() => {
    const titular = availableCourses.filter(course => course.assignmentType === 'titular');
    const specialist = availableCourses.filter(course => course.assignmentType === 'specialist');
    
    return { titularCourses: titular, specialistCourses: specialist };
  }, [availableCourses]);

  // ========== VISTA COMPLETADA ==========
  if (isCompleted && selectedCourse) {
    return (
      <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <div className="font-semibold text-green-800 dark:text-green-200">
              {selectedCourse.name}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
              <span>Código: {selectedCourse.code}</span>
              {selectedCourse.area && (
                <>
                  <span>•</span>
                  <span>{selectedCourse.area}</span>
                </>
              )}
              {(selectedCourse as CourseWithAssignment).assignmentType && (
                <>
                  <span>•</span>
                  <Badge 
                    variant="secondary" 
                    className="text-xs"
                  >
                    {(selectedCourse as CourseWithAssignment).assignmentType === 'titular' ? 'Titular' : 'Especialista'}
                  </Badge>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <Button
            onClick={onEdit}
            variant="ghost"
            size="sm"
            className="text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200"
          >
            Cambiar
          </Button>
        </div>
      </div>
    );
  }

  // ========== ESTADOS DE CARGA Y ERROR ==========
  if (loadingAssignments) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <User2 className="h-4 w-4" />
          <span>Cargando cursos de {selectedTeacher.givenNames} {selectedTeacher.lastNames}...</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="border-dashed">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // ========== ESTADO VACÍO ==========
  if (availableCourses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <BookOpen className="h-8 w-8 text-gray-400 dark:text-gray-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Sin cursos asignados
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
          {selectedTeacher.givenNames} {selectedTeacher.lastNames} no tiene cursos asignados 
          en la sección {selectedSection.name} o las asignaciones no están activas.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-md mx-auto">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <div className="font-medium mb-1">¿Qué hacer?</div>
              <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                <li>• Verificar las asignaciones de cursos</li>
                <li>• Confirmar que el profesor esté activo</li>
                <li>• Revisar la configuración de la sección</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========== COMPONENTE DE CURSO ==========
  const CourseCard = ({ course, index }: { course: CourseWithAssignment, index: number }) => (
    <Card 
      className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-2 hover:border-blue-300 dark:hover:border-blue-600"
      onClick={() => onSelect(course)}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header del curso */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                {course.name}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Código: {course.code}
              </p>
            </div>
            <div 
              className="w-6 h-6 rounded-full flex-shrink-0"
              style={{ backgroundColor: course.color || '#6B7280' }}
              title={course.color ? `Color del curso: ${course.color}` : 'Sin color asignado'}
            />
          </div>

          {/* Información adicional */}
          <div className="space-y-2">
            {course.area && (
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {course.area}
                </span>
              </div>
            )}

            {/* Badges */}
            <div className="flex gap-2 flex-wrap">
              <Badge 
                variant={course.assignmentType === 'titular' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {course.assignmentType === 'titular' ? 'Titular' : 'Especialista'}
              </Badge>
              
              {course.isActive && (
                <Badge variant="outline" className="text-xs text-green-600 dark:text-green-400">
                  Activo
                </Badge>
              )}
            </div>
          </div>

          {/* Indicador de selección */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Click para seleccionar
            </span>
            <div className="text-blue-600 dark:text-blue-400">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // ========== RENDER PRINCIPAL ==========
  return (
    <div className="space-y-6">
      {/* Info del contexto */}
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
        <User2 className="h-4 w-4" />
        <span>
          Cursos de <span className="font-medium">
            {selectedTeacher.givenNames} {selectedTeacher.lastNames}
          </span> en sección <span className="font-medium">
            {selectedSection.name}
          </span>
        </span>
      </div>

      {/* Cursos Titulares */}
      {titularCourses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Cursos como Titular
            </h3>
            <Badge variant="default" className="text-xs">
              {titularCourses.length}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {titularCourses.map((course, index) => (
              <CourseCard 
                key={`titular-${course.id}`} 
                course={course} 
                index={index}
              />
            ))}
          </div>
        </div>
      )}

      {/* Cursos como Especialista */}
      {specialistCourses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Cursos como Especialista
            </h3>
            <Badge variant="secondary" className="text-xs">
              {specialistCourses.length}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {specialistCourses.map((course, index) => (
              <CourseCard 
                key={`specialist-${course.id}`} 
                course={course} 
                index={index}
              />
            ))}
          </div>
        </div>
      )}

      {/* Información adicional */}
      {(titularCourses.length > 0 || specialistCourses.length > 0) && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                Información sobre tipos de asignación:
              </div>
              <div className="space-y-2 text-blue-700 dark:text-blue-300">
                <div className="flex gap-2">
                  <Badge variant="default" className="text-xs">Titular</Badge>
                  <span>Profesor encargado principal del curso en esta sección</span>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-xs">Especialista</Badge>
                  <span>Profesor especializado que apoya en materias específicas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}