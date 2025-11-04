// src/components/features/course-assignments/CourseAssignmentsTable.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BookOpen, 
  AlertCircle, 
  CheckCircle, 
  UserCheck, 
  Users, 
  Loader2,
  Save,
  X,
  Info
} from 'lucide-react';
import { courseAssignmentsService } from '@/services/course-assignments.service';
import { 
  CourseAssignmentFormData, 
  SectionAssignmentData,
  AssignmentType 
} from '@/types/course-assignments.types';
import { toast } from 'sonner';
import AssignmentSummary from './AssignmentSummary';

interface CourseAssignmentsTableProps {
  gradeId: number;
  sectionId: number;
}

interface AssignmentRow {
  courseId: number;
  courseName: string;
  courseCode: string;
  courseArea: string | null;
  teacherId: number;
  teacherName: string;
  assignmentType: AssignmentType;
  isModified: boolean;
  hasSchedules: boolean;
}

export default function CourseAssignmentsTable({
  gradeId,
  sectionId,
}: CourseAssignmentsTableProps) {
  const [sectionData, setSectionData] = useState<SectionAssignmentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [assignmentRows, setAssignmentRows] = useState<AssignmentRow[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Cargar datos de la sección
  useEffect(() => {
    loadSectionData();
  }, [sectionId]);

  // Construir filas cuando cambien los datos
  useEffect(() => {
    if (sectionData) {
      buildAssignmentRows();
    }
  }, [sectionData]);

  const loadSectionData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await courseAssignmentsService.getSectionAssignmentData(sectionId);
      setSectionData(data);
    } catch (err: any) {
      const message = err.message || 'Error al cargar datos de la sección';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const buildAssignmentRows = () => {
    if (!sectionData) return;

    // Obtener todos los cursos disponibles para esta sección
    const allCourses = sectionData.availableCourses.filter((c) => c.isActive);

    const rows: AssignmentRow[] = allCourses.map((course) => {
      // Buscar asignación existente
      const existingAssignment = sectionData.assignments.find(
        a => a.courseId === course.id
      );

      // Por defecto, usar maestro titular de la sección
      const defaultTeacherId = sectionData.section.teacherId || 
                               (sectionData.availableTeachers.length > 0 ? sectionData.availableTeachers[0].id : 0);

      return {
        courseId: course.id,
        courseName: course.name,
        courseCode: course.code,
        courseArea: course.area,
        teacherId: existingAssignment?.teacherId || defaultTeacherId,
        teacherName: existingAssignment?.teacher.fullName || 
                     sectionData.availableTeachers.find((t) => t.id === defaultTeacherId)?.fullName || 'Sin asignar',
        assignmentType: (existingAssignment?.assignmentType as AssignmentType) || 'titular',
        isModified: false,
        hasSchedules: existingAssignment?._count.schedules ? existingAssignment._count.schedules > 0 : false,
      };
    });

    setAssignmentRows(rows);
    setHasChanges(false);
  };

  const handleTeacherChange = (courseId: number, teacherId: string) => {
    const newTeacherId = parseInt(teacherId);
    const teacher = sectionData?.availableTeachers.find((t) => t.id === newTeacherId);
    
    setAssignmentRows(prevRows =>
      prevRows.map(row =>
        row.courseId === courseId
          ? {
              ...row,
              teacherId: newTeacherId,
              teacherName: teacher?.fullName || 'Sin asignar',
              isModified: true,
            }
          : row
      )
    );
    setHasChanges(true);
  };

  const handleAssignmentTypeChange = (courseId: number, type: string) => {
    setAssignmentRows(prevRows =>
      prevRows.map(row =>
        row.courseId === courseId
          ? {
              ...row,
              assignmentType: type as AssignmentType,
              isModified: true,
            }
          : row
      )
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Preparar datos para el bulk update
      const assignmentsToSave = assignmentRows.map(row => ({
        courseId: row.courseId,
        teacherId: row.teacherId,
        assignmentType: row.assignmentType,
      }));

      // Usar la nueva estructura del endpoint
      await courseAssignmentsService.bulkUpdateCourseAssignments({
        sectionId: sectionId,
        assignments: assignmentsToSave,
      });

      // Recargar datos
      await loadSectionData();
      
      toast.success('Asignaciones guardadas exitosamente');
      setHasChanges(false);
    } catch (err: any) {
      const message = err.message || 'Error al guardar asignaciones';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    buildAssignmentRows();
    setHasChanges(false);
  };

  // Agrupar maestros por tipo
  const categorizedTeachers = useMemo(() => {
    if (!sectionData) return { titular: [], others: [] };
    
    const titular = sectionData.availableTeachers.filter((t) => 
      sectionData.section.teacherId === t.id
    );
    const others = sectionData.availableTeachers.filter((t) => 
      sectionData.section.teacherId !== t.id && t.isActive
    );

    return { titular, others };
  }, [sectionData]);

  if (isLoading) {
    return (
      <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
            <span className="ml-3 text-gray-900 dark:text-gray-100">Cargando asignaciones...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !sectionData) {
    return (
      <Alert className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
        <AlertDescription className="text-red-700 dark:text-red-300">
          {error || 'No se pudieron cargar los datos'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <AssignmentSummary sectionData={sectionData} />

      {/* Main Table Card */}
      <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Asignación de Maestros por Curso
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Asigne un maestro a cada curso de la sección
              </CardDescription>
            </div>
            {hasChanges && (
              <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                {assignmentRows.filter(r => r.isModified).length} cambios pendientes
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200 dark:border-gray-800">
                  <TableHead className="text-gray-900 dark:text-gray-100">Código</TableHead>
                  <TableHead className="text-gray-900 dark:text-gray-100">Curso</TableHead>
                  <TableHead className="text-gray-900 dark:text-gray-100">Área</TableHead>
                  <TableHead className="text-gray-900 dark:text-gray-100">Maestro Asignado</TableHead>
                  <TableHead className="text-gray-900 dark:text-gray-100">Tipo</TableHead>
                  <TableHead className="text-gray-900 dark:text-gray-100 text-center">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignmentRows.map((row) => (
                  <TableRow 
                    key={row.courseId}
                    className={`
                      border-gray-200 dark:border-gray-800
                      ${row.isModified ? 'bg-amber-50 dark:bg-amber-900/10' : ''}
                    `}
                  >
                    <TableCell className="font-mono text-sm text-gray-600 dark:text-gray-400">
                      {row.courseCode}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                      {row.courseName}
                    </TableCell>
                    <TableCell>
                      {row.courseArea && (
                        <Badge variant="outline" className="text-xs">
                          {row.courseArea}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={row.teacherId.toString()}
                        onValueChange={(value) => handleTeacherChange(row.courseId, value)}
                      >
                        <SelectTrigger className="w-full border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                          {categorizedTeachers.titular.length > 0 && (
                            <>
                              <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                                Maestro Titular
                              </div>
                              {categorizedTeachers.titular.map((teacher) => (
                                <SelectItem 
                                  key={teacher.id} 
                                  value={teacher.id.toString()}
                                  className="hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <div className="flex items-center gap-2">
                                    <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    {teacher.fullName}
                                  </div>
                                </SelectItem>
                              ))}
                            </>
                          )}
                          {categorizedTeachers.others.length > 0 && (
                            <>
                              <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 mt-1">
                                Otros Maestros
                              </div>
                              {categorizedTeachers.others.map((teacher) => (
                                <SelectItem 
                                  key={teacher.id} 
                                  value={teacher.id.toString()}
                                  className="hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  {teacher.fullName}
                                </SelectItem>
                              ))}
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={row.assignmentType}
                        onValueChange={(value) => handleAssignmentTypeChange(row.courseId, value)}
                      >
                        <SelectTrigger className="w-32 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                          <SelectItem value="titular">Titular</SelectItem>
                          <SelectItem value="apoyo">Apoyo</SelectItem>
                          <SelectItem value="temporal">Temporal</SelectItem>
                          <SelectItem value="suplente">Suplente</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-center">
                      {row.isModified ? (
                        <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                          Modificado
                        </Badge>
                      ) : row.hasSchedules ? (
                        <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                          Con horarios
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-600 dark:text-gray-400">
                          Sin cambios
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Info Alert */}
      {assignmentRows.some(r => r.hasSchedules) && (
        <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            Algunos cursos ya tienen horarios asignados. Los cambios afectarán esos horarios.
          </AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      {hasChanges && (
        <Card className="border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <span className="font-medium">
                  Tienes cambios sin guardar
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="border-gray-300 dark:border-gray-700"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
