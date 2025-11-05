// src/components/features/course-assignments/components/course-teacher-table.tsx
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookOpen, AlertCircle, CheckCircle, UserCheck, Users } from 'lucide-react';
import { useCourseAssignmentSection } from '@/hooks/useCourseAssignment';
import { AssignmentType } from '@/types/course-assignments.types';
import BulkSaveActions from './bulk-save-actions';
import AssignmentSummary from './assignment-summary';

interface CourseTeacherTableProps {
  gradeId: number;
  sectionId: number;
  canUpdate?: boolean;     // ✅ NUEVO
  canBulkUpdate?: boolean; // ✅ NUEVO
}
interface CourseAssignmentRow {
  courseId: number;
  courseName: string;
  courseCode: string;
  courseArea?: string | null;
  courseColor?: string | null;
  currentTeacherId?: number | null;
  currentTeacherName?: string;
  assignmentType: AssignmentType;
  isModified: boolean;
}

export default function CourseTeacherTable({ 
  gradeId, 
  sectionId,
  canUpdate = false,      // ✅ NUEVO
  canBulkUpdate = false   // ✅ NUEVO
}: CourseTeacherTableProps) {
// ✅ NUEVO: Usar el hook especializado para sección
  const { 
    sectionData, 
    isLoading, 
    isSubmitting,
    error, 
    bulkUpdate 
  } = useCourseAssignmentSection(sectionId);

  const [assignmentRows, setAssignmentRows] = useState<CourseAssignmentRow[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Helper para obtener el label del tipo de asignación
  const getAssignmentTypeLabel = (type: AssignmentType): string => {
    const labels: Record<AssignmentType, string> = {
      titular: 'Titular',
      apoyo: 'Apoyo',
      temporal: 'Temporal',
      suplente: 'Suplente'
    };
    return labels[type] || type;
  };

  // Helper para categorizar maestros
  const categorizedTeachers = useMemo(() => {
    if (!sectionData || !sectionData.availableTeachers) {
      return { titular: [], specialists: [], otherTitular: [] };
    }

    const teachers = sectionData.availableTeachers;
    const currentSectionTeacherId = sectionData.section.teacherId;
    
    return {
      // Maestro titular de ESTA sección específica
      titular: teachers.filter(t => t.id === currentSectionTeacherId),
      // Maestros sin sección asignada (especialistas puros)
      specialists: teachers.filter(t => 
        t.id !== currentSectionTeacherId && 
        (!t.sections || t.sections.length === 0)
      ),
      // Maestros titulares de OTRAS secciones
      otherTitular: teachers.filter(t => 
        t.id !== currentSectionTeacherId && 
        t.sections && 
        t.sections.length > 0
      )
    };
  }, [sectionData]);

  // Helper para obtener maestro por ID
  const getTeacherById = (teacherId: number) => {
    if (!sectionData || !sectionData.availableTeachers) return null;
    return sectionData.availableTeachers.find(t => t.id === teacherId);
  };

  // Construir filas de la tabla cuando cambien los datos
  useEffect(() => {
    if (!sectionData || !sectionData.availableCourses) return;

    const rows: CourseAssignmentRow[] = sectionData.availableCourses.map(course => {
      // Buscar si ya existe una asignación para este curso
      const existingAssignment = sectionData.assignments.find(
        a => a.courseId === course.id
      );

      // Por defecto, asignar al maestro titular de la sección
      let defaultTeacherId = sectionData.section.teacherId;
      let defaultTeacherName = sectionData.section.teacher 
        ? sectionData.section.teacher.fullName
        : undefined;
      let defaultAssignmentType: AssignmentType = 'titular'; // Por defecto es titular
      let courseColor = course.color || '#6B7280'; // Usar color del curso o gris por defecto

      // Si ya existe una asignación, usar esos datos
      if (existingAssignment) {
        defaultTeacherId = existingAssignment.teacherId;
        defaultTeacherName = existingAssignment.teacher.fullName;
        // Usar el color del curso desde la asignación (más actualizado)
        courseColor = existingAssignment.course.color || course.color || '#6B7280';
        // Usar el assignmentType del backend directamente
        defaultAssignmentType = existingAssignment.assignmentType;
      }

      return {
        courseId: course.id,
        courseName: course.name,
        courseCode: course.code,
        courseArea: course.area,
        courseColor: courseColor,
        currentTeacherId: defaultTeacherId,
        currentTeacherName: defaultTeacherName,
        assignmentType: defaultAssignmentType,
        isModified: false
      };
    });

    setAssignmentRows(rows);
    setHasChanges(false);
  }, [sectionData]);

  // Manejar cambio de maestro en una fila
  const handleTeacherChange = (courseId: number, teacherId: number) => {
    setAssignmentRows(prev => 
      prev.map(row => {
        if (row.courseId === courseId) {
          const selectedTeacher = getTeacherById(teacherId);
          const isDefaultTeacher = sectionData?.section.teacherId === teacherId;
          
          return {
            ...row,
            currentTeacherId: teacherId,
            currentTeacherName: selectedTeacher 
              ? `${selectedTeacher.givenNames} ${selectedTeacher.lastNames}`
              : undefined,
            assignmentType: isDefaultTeacher ? 'titular' : 'apoyo',
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
        courseId: row.courseId,
        teacherId: row.currentTeacherId!
      }));

    const success = await bulkUpdate({
      sectionId,
      assignments
    });
    
    if (success) {
      setHasChanges(false);
      setAssignmentRows(prev => 
        prev.map(row => ({ ...row, isModified: false }))
      );
    }
  };

  // Resetear cambios
  const handleResetChanges = () => {
    if (!sectionData || !sectionData.availableCourses) return;
    
    // Reconstruir filas desde sectionData
    const rows: CourseAssignmentRow[] = sectionData.availableCourses.map(course => {
      const existingAssignment = sectionData.assignments.find(
        a => a.courseId === course.id
      );

      // Determinar el color del curso
      const courseColor = existingAssignment?.course.color || course.color || '#6B7280';

      return {
        courseId: course.id,
        courseName: course.name,
        courseCode: course.code,
        courseArea: course.area,
        courseColor: courseColor,
        currentTeacherId: existingAssignment?.teacherId || sectionData.section.teacherId,
        currentTeacherName: existingAssignment?.teacher.fullName || 
          sectionData.section.teacher?.fullName,
        assignmentType: existingAssignment?.assignmentType || 'titular',
        isModified: false
      };
    });

    setAssignmentRows(rows);
    setHasChanges(false);
  };

  // Loading state
  if (isLoading) {
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

  // Error state
  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
        <AlertDescription className="text-red-800 dark:text-red-200">
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  // No data
  if (!sectionData) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
        <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        <AlertDescription className="text-yellow-800 dark:text-yellow-200">
          No se encontraron datos de la sección.
        </AlertDescription>
      </Alert>
    );
  }

  // Sin maestro titular
  if (!sectionData.section.teacher) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
        <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        <AlertDescription className="text-yellow-800 dark:text-yellow-200">
          No se encontró un maestro titular para esta sección. Asigne un maestro titular primero.
        </AlertDescription>
      </Alert>
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
            {sectionData.section.gradeName} - Sección {sectionData.section.name}
            {sectionData.section.teacher && (
              <span className="ml-2">
                • Maestro Titular: {sectionData.section.teacher.givenNames} {sectionData.section.teacher.lastNames}
              </span>
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Acciones de guardado si hay cambios */}
  {hasChanges && canBulkUpdate && ( // ✅ MODIFICADO
        <BulkSaveActions
          onSave={handleSaveAll}
          onReset={handleResetChanges}
          hasChanges={hasChanges}
          isSubmitting={isSubmitting}
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
                  {assignmentRows.map((row) => (
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
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: row.courseColor || '#6B7280' }}
                          />
                          <div>
                            <p 
                              className="font-bold"
                              style={{ color: row.courseColor || '#6B7280' }}
                            >
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
                           disabled={!canUpdate}
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
                            {categorizedTeachers.titular.length > 0 && (
                              <>
                                <div className="px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950">
                                  Maestro Titular
                                </div>
                                {categorizedTeachers.titular.map((teacher) => (
                                  <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                    <div className="flex items-center gap-2 w-full">
                                      <UserCheck className="h-3 w-3 text-blue-500" />
                                      <div className="flex-1">
                                        <p className="font-medium">{teacher.fullName}</p>
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
                            {categorizedTeachers.specialists.length > 0 && (
                              <>
                                <div className="px-2 py-1 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950">
                                  Maestros Especialistas
                                </div>
                                {categorizedTeachers.specialists.map((teacher) => (
                                  <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                    <div className="flex items-center gap-2 w-full">
                                      <Users className="h-3 w-3 text-purple-500" />
                                      <div className="flex-1">
                                        <p className="font-medium">{teacher.fullName}</p>
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
                            {categorizedTeachers.otherTitular.length > 0 && (
                              <>
                                <div className="px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900">
                                  Otros Maestros Titulares
                                </div>
                                {categorizedTeachers.otherTitular.map((teacher) => (
                                  <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                    <div className="flex items-center gap-2 w-full">
                                      <UserCheck className="h-3 w-3 text-gray-500" />
                                      <div className="flex-1">
                                        <p className="font-medium">{teacher.fullName}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                          {teacher.sections && teacher.sections.length > 0 
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
                              {getAssignmentTypeLabel(row.assignmentType)}
                            </>
                          ) : (
                            <>
                              <Users className="h-3 w-3 mr-1" />
                              {getAssignmentTypeLabel(row.assignmentType)}
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
                  ))}
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
          specialistCourses={assignmentRows.filter(row => row.assignmentType !== 'titular').length}
          hasChanges={hasChanges}
        />
      )}
    </div>
  );
}