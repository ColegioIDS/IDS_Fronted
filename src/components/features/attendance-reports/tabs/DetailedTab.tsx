'use client';

import { useStudentsAttendance } from '@/hooks/data/attendance-reports';
import { StudentsTable } from '../shared/StudentsTable';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Users } from 'lucide-react';

interface DetailedTabProps {
  gradeId?: number;
  sectionId?: number;
  courseId?: number;
  bimesterId?: number | null;
  academicWeekId?: number | null;
}

export function DetailedTab({
  gradeId,
  sectionId,
  courseId,
  bimesterId,
  academicWeekId,
}: DetailedTabProps) {
  const {
    data: studentsAttendance,
    isLoading,
    error,
    isError,
  } = useStudentsAttendance({
    gradeId,
    sectionId,
    courseId,
    bimesterId,
    academicWeekId,
  });

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error?.message || 'Error al cargar el reporte detallado'}
        </AlertDescription>
      </Alert>
    );
  }

  if (!studentsAttendance && !isLoading) {
    return (
      <Card className="border-gray-200 dark:border-gray-700 border-dashed">
        <CardContent className="p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            No hay datos disponibles
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {studentsAttendance && (
        <>
          {/* Course Info */}
          <Card className="border-gray-200 dark:border-gray-700 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase">Curso</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                    {studentsAttendance.course.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {studentsAttendance.course.code}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase">Docente</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                    {studentsAttendance.course.teacher.givenNames} {studentsAttendance.course.teacher.lastNames}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase">Sección</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                    {studentsAttendance.section.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {studentsAttendance.section.totalStudents} estudiantes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Students Table */}
          <StudentsTable
            students={studentsAttendance.students}
            totalClasses={studentsAttendance.summary.totalClasses}
            averageAttendance={studentsAttendance.summary.averageAttendance}
            isLoading={isLoading}
          />
        </>
      )}
    </div>
  );
}
