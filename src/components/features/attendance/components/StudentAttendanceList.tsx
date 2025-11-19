// src/components/features/attendance/components/StudentAttendanceList.tsx
/**
 * Componente para mostrar lista de estudiantes de una sección
 * Utiliza el nuevo hook useSectionStudents
 * Permite seleccionar estado de asistencia para cada estudiante
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2, Users, CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { useSectionStudents, StudentForAttendance } from '@/hooks/attendance';
import { AttendanceStatusInfo } from '@/types/attendance.types';

interface StudentAttendanceListProps {
  sectionId: number;
  statuses: AttendanceStatusInfo[];
  onStudentSelect?: (enrollmentId: number, statusId: number) => void;
  selectedStatuses?: Map<number, number>; // Map<enrollmentId, statusId>
}

interface StudentWithStatus extends StudentForAttendance {
  selectedStatusId?: number;
}

interface StudentAttendanceRowProps {
  student: StudentWithStatus;
  statuses: AttendanceStatusInfo[];
  onStatusChange: (statusId: number) => void;
}

export function StudentAttendanceList({
  sectionId,
  statuses,
  onStudentSelect,
  selectedStatuses = new Map(),
}: StudentAttendanceListProps) {
  const { students, isLoading, error, enrollmentCount, fetchStudents } =
    useSectionStudents();

  // Cargar estudiantes cuando el componente se monta
  React.useEffect(() => {
    if (sectionId) {
      fetchStudents(sectionId, false); // false = solo estudiantes activos
    }
  }, [sectionId, fetchStudents]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center gap-3 py-12">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-gray-600 dark:text-gray-400">Loading students...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Students</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!students || students.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Students</AlertTitle>
        <AlertDescription>No students found in this section.</AlertDescription>
      </Alert>
    );
  }

  const studentsWithStatus: StudentWithStatus[] = students.map((student) => ({
    ...student,
    selectedStatusId: selectedStatuses.get(student.id),
  }));

  return (
    <div className="space-y-6">
      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Students ({students.length})
          </CardTitle>
          <CardDescription>Select attendance status for each student</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Botones de selección rápida masiva */}
            <div className="flex flex-wrap gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 self-center">
                Mark all as:
              </span>
              {statuses.map((status) => (
                <button
                  key={status.id}
                  onClick={() => {
                    const newMap = new Map<number, number>();
                    students.forEach((student) => {
                      newMap.set(student.id, status.id);
                    });
                    // Actualizar todos los estados
                    students.forEach((student) => {
                      onStudentSelect?.(student.id, status.id);
                    });
                  }}
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900 border border-gray-300 dark:border-gray-600 transition-colors"
                  title={`Mark all as ${status.name}`}
                >
                  {getStatusIcon(status.code)}
                  <span>{status.name}</span>
                </button>
              ))}
            </div>

            {/* Lista de estudiantes */}
            <div className="space-y-2">
              {studentsWithStatus.map((student) => (
                <StudentAttendanceRow
                  key={student.id}
                  student={student}
                  statuses={statuses}
                  onStatusChange={(statusId) => {
                    onStudentSelect?.(student.id, statusId);
                  }}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// SUBCOMPONENT: Single Student Row
// ============================================================================

function StudentAttendanceRow({ student, statuses, onStatusChange }: StudentAttendanceRowProps) {
  const selectedStatus = statuses.find((s) => s.id === student.selectedStatusId);
  const fullName = `${student.student.givenNames} ${student.student.lastNames}`;

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
      {/* Student Info */}
      <div className="flex flex-1 items-center gap-3">
        {/* Avatar */}
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-300 dark:bg-blue-600">
          <span className="text-xs font-semibold text-white">
            {student.student.givenNames.charAt(0)}
          </span>
        </div>

        {/* Student Details */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{fullName}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{student.student.codeSIRE}</p>
        </div>
      </div>

      {/* Status Selection - Botones en lugar de select */}
      <div className="flex items-center gap-1 flex-wrap">
        {statuses.map((status) => (
          <button
            key={status.id}
            onClick={() => onStatusChange(status.id)}
            className={`
              flex items-center gap-1 px-2 py-1 rounded text-xs font-medium
              transition-all duration-200
              ${
                student.selectedStatusId === status.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }
            `}
            title={status.name}
          >
            {getStatusIcon(status.code)}
            <span className="hidden sm:inline">{status.name.substring(0, 1)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function getStatusIcon(code: string) {
  const iconClass = 'h-4 w-4';

  switch (code) {
    case 'P':
      return <CheckCircle2 className={`${iconClass} text-green-600`} />;
    case 'I':
      return <XCircle className={`${iconClass} text-red-600`} />;
    case 'T':
      return <Clock className={`${iconClass} text-amber-600`} />;
    case 'IJ':
      return <AlertTriangle className={`${iconClass} text-blue-600`} />;
    default:
      return <AlertCircle className={`${iconClass} text-gray-600`} />;
  }
}
