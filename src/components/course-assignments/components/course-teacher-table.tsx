// src/components/course-assignments/components/course-teacher-table.tsx
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookOpen, AlertCircle, CheckCircle, UserCheck, Users } from 'lucide-react';
import { useCourseContext } from '@/context/CourseContext';
import { useSectionContext } from '@/context/SectionsContext';
import { useCourseAssignmentContext } from '@/context/CourseAssignmentContext';
import { useTeachersBySection, TeacherOption } from '@/context/newTeachersContext';
import BulkSaveActions from './bulk-save-actions';
import AssignmentSummary from './assignment-summary';

interface CourseTeacherTableProps {
  gradeId: number;
  sectionId: number;
}

interface CourseAssignmentRow {
  courseId: number;
  courseName: string;
  courseArea?: string | null;
  courseColor?: string | null;
  currentTeacherId?: number | null;
  currentTeacherName?: string;
  assignmentType: 'titular' | 'specialist';
  isModified: boolean;
}

export default function CourseTeacherTable({ gradeId, sectionId }: CourseTeacherTableProps) {
  const { state: courseState, fetchCourses } = useCourseContext();
  const { state: sectionState } = useSectionContext();
  const { 
    fetchSectionAssignments, 
    state: assignmentState,
    bulkUpdateAssignments,
    setSelectedSection
  } = useCourseAssignmentContext();

  // USAR EL NUEVO HOOK DE TEACHERS
  const {
    categorized,
    raw: teachersData,
    loading: teachersLoading,
    error: teachersError,
    getTeacherById,
    defaultTeacher
  } = useTeachersBySection(sectionId);

  const [assignmentRows, setAssignmentRows] = useState<CourseAssignmentRow[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Obtener la sección actual del contexto
  const currentSection = sectionState.sections.find(s => s.id === sectionId);

  // DEBUG: Agregar logs para ver qué está pasando
  console.log('🔍 Teachers data:', teachersData);
  console.log('🔍 Categorized teachers:', categorized);
  console.log('🔍 Default teacher:', defaultTeacher);
  console.log('🔍 Current section:', currentSection);
  console.log('🔍 Categorized titular:', categorized.titular);
  console.log('🔍 Categorized specialists:', categorized.specialists);
  console.log('🔍 Categorized otherTitular:', categorized.otherTitular);

  // Obtener todos los maestros disponibles en formato simple para el select
  const availableTeachers = useMemo(() => {
    const allOptions = [
      ...categorized.titular,
      ...categorized.specialists,
      ...categorized.otherTitular
    ];
    
    return allOptions.map(teacher => ({
      value: teacher.value,
      label: teacher.label,
      email: teacher.email || '',
      type: teacher.type,
      sections: teacher.sections,
      teacher: teacher.teacher
    }));
  }, [categorized]);

  // Cargar datos iniciales
  useEffect(() => {
    if (courseState.courses.length === 0 && !courseState.loading) {
      fetchCourses();
    }
  }, [fetchCourses, courseState.courses.length, courseState.loading]);

  useEffect(() => {
    if (sectionId) {
      setSelectedSection(sectionId);
      fetchSectionAssignments(sectionId);
    }
  }, [sectionId, setSelectedSection, fetchSectionAssignments]);

  // Construir filas de la tabla cuando cambien los datos
  useEffect(() => {
    if (courseState.courses.length > 0 && defaultTeacher && !courseState.loading) {
      // Obtener cursos activos (idealmente filtrados por grado)
      const gradeCourses = courseState.courses.filter(course => course.isActive);

      const rows: CourseAssignmentRow[] = gradeCourses.map(course => {
        // Buscar si ya existe una asignación para este curso-sección
        const existingAssignment = assignmentState.assignments.find(
          a => a.courseId === course.id && a.sectionId === sectionId
        );

        // Por defecto, asignar al maestro titular de la sección
        let defaultTeacherId = defaultTeacher.id;
        let defaultTeacherName = `${defaultTeacher.givenNames} ${defaultTeacher.lastNames}`;
        let defaultAssignmentType: 'titular' | 'specialist' = 'titular';

        // Si ya existe una asignación, usar esos datos
        if (existingAssignment) {
          defaultTeacherId = existingAssignment.teacherId;
          const assignedTeacher = getTeacherById(existingAssignment.teacherId);
          defaultTeacherName = assignedTeacher 
            ? `${assignedTeacher.givenNames} ${assignedTeacher.lastNames}` 
            : '';
          defaultAssignmentType = existingAssignment.assignmentType;
        }

        return {
          courseId: course.id,
          courseName: course.name,
          courseArea: course.area || null,
          courseColor: course.color || null,
          currentTeacherId: defaultTeacherId,
          currentTeacherName: defaultTeacherName,
          assignmentType: defaultAssignmentType,
          isModified: false
        };
      });

      // Solo actualizar si hay cambios reales
      setAssignmentRows(prevRows => {
        const hasChangedRows = JSON.stringify(prevRows) !== JSON.stringify(rows);
        if (hasChangedRows) {
          setHasChanges(false);
          return rows;
        }
        return prevRows;
      });
    }
  }, [
    courseState.courses, 
    courseState.loading,
    assignmentState.assignments, 
    defaultTeacher,
    gradeId, 
    sectionId, 
    getTeacherById
  ]);

  // Manejar cambio de maestro en una fila
  const handleTeacherChange = (courseId: number, teacherId: number) => {
    setAssignmentRows(prev => 
      prev.map(row => {
        if (row.courseId === courseId) {
          const selectedTeacher = getTeacherById(teacherId);
          const isDefaultTeacher = defaultTeacher?.id === teacherId;
          
          return {
            ...row,
            currentTeacherId: teacherId,
            currentTeacherName: selectedTeacher 
              ? `${selectedTeacher.givenNames} ${selectedTeacher.lastNames}`
              : undefined,
            assignmentType: isDefaultTeacher ? 'titular' : 'specialist',
            isModified: true
          };
        }
        return row;
      })
    );
    setHasChanges(true);
  };

  // Guardar todos los cambios
  const handleSaveAll = async () => {
    const assignments = assignmentRows
      .filter(row => row.currentTeacherId) // Solo filas con maestro asignado
      .map(row => ({
        sectionId,
        courseId: row.courseId,
        teacherId: row.currentTeacherId!,
        assignmentType: row.assignmentType
      }));

    try {
      const result = await bulkUpdateAssignments({
        gradeId,
        assignments: assignments.map(assignment => ({
          ...assignment,
          sectionId // Mover sectionId dentro de cada assignment
        }))
      });
      
      if (result.success) {
        setHasChanges(false);
        setAssignmentRows(prev => 
          prev.map(row => ({ ...row, isModified: false }))
        );
      }
    } catch (error) {
      console.error('Error saving assignments:', error);
    }
  };

  // Resetear cambios
  const handleResetChanges = () => {
    fetchSectionAssignments(sectionId);
    setHasChanges(false);
  };

  // Estados de error o carga
  if (teachersError) {
    return (
      <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
        <AlertDescription className="text-red-800 dark:text-red-200">
          {teachersError}
        </AlertDescription>
      </Alert>
    );
  }

  if (!defaultTeacher) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
        <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        <AlertDescription className="text-yellow-800 dark:text-yellow-200">
          No se encontró un maestro titular para esta sección. Asigne un maestro titular primero.
        </AlertDescription>
      </Alert>
    );
  }

  if (courseState.loading || teachersLoading || assignmentState.loading) {
    return (
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded flex-1 animate-pulse" />
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con información de la selección */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <BookOpen className="h-5 w-5" />
            Asignación de Cursos y Maestros
          </CardTitle>
          <CardDescription className="text-blue-700 dark:text-blue-300">
            {currentSection?.grade?.name} - Sección {currentSection?.name}
            {defaultTeacher && (
              <span className="ml-2">
                • Maestro Titular: {defaultTeacher.givenNames} {defaultTeacher.lastNames}
              </span>
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Acciones de guardado si hay cambios */}
      {hasChanges && (
        <BulkSaveActions
          onSave={handleSaveAll}
          onReset={handleResetChanges}
          hasChanges={hasChanges}
          isSubmitting={assignmentState.submitting}
          modifiedCount={assignmentRows.filter(row => row.isModified).length}
        />
      )}

      {/* Tabla de asignaciones */}
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gray-900 dark:text-gray-100">
                Cursos y Profesores
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Asigne maestros a cada curso del grado
              </CardDescription>
            </div>
            
            {hasChanges && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800">
                  {assignmentRows.filter(row => row.isModified).length} cambios pendientes
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {assignmentRows.length === 0 ? (
            <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
              <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                No hay cursos configurados para este grado. Configure los cursos primero.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-900">
                    <TableHead className="text-gray-700 dark:text-gray-300">Curso</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">Profesor Asignado</TableHead>
                    <TableHead className="text-center text-gray-700 dark:text-gray-300">Tipo</TableHead>
                    <TableHead className="text-center text-gray-700 dark:text-gray-300">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignmentRows.map((row) => {
                    return (
                      <TableRow 
                        key={row.courseId}
                        className={`transition-colors ${
                          row.isModified 
                            ? 'bg-orange-50 dark:bg-orange-950 border-l-4 border-l-orange-400 dark:border-l-orange-600' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        {/* Columna: Curso */}
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: row.courseColor || '#6B7280' }}
                            />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">
                                {row.courseName}
                              </p>
                              {row.courseArea && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {row.courseArea}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Columna: Profesor */}
                        <TableCell>
                          <Select
                            value={row.currentTeacherId?.toString() || ''}
                            onValueChange={(value) => handleTeacherChange(row.courseId, parseInt(value))}
                          >
                            <SelectTrigger className={`w-full ${
                              row.isModified 
                                ? 'border-orange-300 dark:border-orange-700' 
                                : ''
                            }`}>
                              <SelectValue placeholder="Seleccionar maestro" />
                            </SelectTrigger>
                            <SelectContent>
                              {/* Maestro Titular de esta sección */}
                              {categorized.titular.length > 0 && (
                                <>
                                  <div className="px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950">
                                    Maestro Titular
                                  </div>
                                  {categorized.titular.map((teacher: TeacherOption) => (
                                    <SelectItem key={teacher.value} value={teacher.value.toString()}>
                                      <div className="flex items-center gap-2 w-full">
                                        <UserCheck className="h-3 w-3 text-blue-500" />
                                        <div className="flex-1">
                                          <p className="font-medium">{teacher.label}</p>
                                          <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Maestro titular
                                          </p>
                                        </div>
                                        <Badge variant="default" className="text-xs bg-blue-600">
                                          Titular
                                        </Badge>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </>
                              )}

                              {/* Maestros Especialistas */}
                              {categorized.specialists.length > 0 && (
                                <>
                                  <div className="px-2 py-1 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950">
                                    Maestros Especialistas
                                  </div>
                                  {categorized.specialists.map((teacher: TeacherOption) => (
                                    <SelectItem key={teacher.value} value={teacher.value.toString()}>
                                      <div className="flex items-center gap-2 w-full">
                                        <Users className="h-3 w-3 text-purple-500" />
                                        <div className="flex-1">
                                          <p className="font-medium">{teacher.label}</p>
                                          <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Especialista
                                          </p>
                                        </div>
                                        <Badge variant="secondary" className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                                          Especialista
                                        </Badge>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </>
                              )}

                              {/* Otros Maestros Titulares */}
                              {categorized.otherTitular.length > 0 && (
                                <>
                                  <div className="px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900">
                                    Otros Maestros Titulares
                                  </div>
                                  {categorized.otherTitular.map((teacher: TeacherOption) => (
                                    <SelectItem key={teacher.value} value={teacher.value.toString()}>
                                      <div className="flex items-center gap-2 w-full">
                                        <UserCheck className="h-3 w-3 text-gray-500" />
                                        <div className="flex-1">
                                          <p className="font-medium">{teacher.label}</p>
                                          <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {teacher.sections.length > 0 
                                              ? `${teacher.sections[0].name}` 
                                              : 'Otra sección'
                                            }
                                          </p>
                                        </div>
                                        <Badge variant="outline" className="text-xs">
                                          Titular
                                        </Badge>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </>
                              )}
                            </SelectContent>
                          </Select>
                        </TableCell>

                        {/* Columna: Tipo de Asignación */}
                        <TableCell className="text-center">
                          <Badge 
                            variant={row.assignmentType === 'titular' ? 'default' : 'secondary'}
                            className={`text-xs ${
                              row.assignmentType === 'titular'
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                : 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                            }`}
                          >
                            {row.assignmentType === 'titular' ? (
                              <>
                                <UserCheck className="h-3 w-3 mr-1" />
                                Titular
                              </>
                            ) : (
                              <>
                                <Users className="h-3 w-3 mr-1" />
                                Especialista
                              </>
                            )}
                          </Badge>
                        </TableCell>

                        {/* Columna: Estado */}
                        <TableCell className="text-center">
                          {row.isModified ? (
                            <Badge variant="outline" className="text-xs bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800">
                              Modificado
                            </Badge>
                          ) : row.currentTeacherId ? (
                            <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Asignado
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                              Sin asignar
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumen de asignaciones */}
      {assignmentRows.length > 0 && (
        <AssignmentSummary 
          totalCourses={assignmentRows.length}
          assignedCourses={assignmentRows.filter(row => row.currentTeacherId).length}
          titularCourses={assignmentRows.filter(row => row.assignmentType === 'titular').length}
          specialistCourses={assignmentRows.filter(row => row.assignmentType === 'specialist').length}
          hasChanges={hasChanges}
        />
      )}
    </div>
  );
}