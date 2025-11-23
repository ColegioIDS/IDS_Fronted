/**
 * TABLA EXPANDIBLE DE ESTUDIANTES CON CURSOS
 * Para TAB 1 - Muestra por estudiante sus cursos y cambios de estado
 */

'use client';

import { useState, Fragment } from 'react';
import { ChevronDown, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AttendanceStatus } from '@/types/attendance.types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { AttendanceStatusSelector } from './AttendanceStatusSelector';

interface StudentData {
  id?: number;
  name?: string;
  enrollmentId: number;
  enrollmentNumber?: string;
  email?: string;
  identificationNumber?: string;
}

interface StudentCourse {
  courseId: number;
  courseName: string;
  originalStatus?: string;
  originalStatusName?: string;
  currentStatus: string;
  currentStatusName: string;
}

interface ConsolidatedStudentData {
  enrollmentId: number;
  studentName: string;
  studentId: number;
  courses: StudentCourse[];
}

interface ExpandableStudentAttendanceTableProps {
  students: StudentData[];
  studentAttendance: Map<number, { enrollmentId: number; status: string; isEarlyExit: boolean }>;
  onStatusChange: (enrollmentId: number, status: string) => void;
  onEarlyExitToggle: (enrollmentId: number, isEarlyExit: boolean) => void;
  allowedStatuses?: AttendanceStatus[];
  isLoading?: boolean;
  existingAttendance?: Map<number, { statusId: number; isEarlyExit: boolean }>;
  consolidatedData?: { students: ConsolidatedStudentData[] };
}

export function ExpandableStudentAttendanceTable({
  students,
  studentAttendance,
  onStatusChange,
  onEarlyExitToggle,
  allowedStatuses = [],
  isLoading = false,
  existingAttendance = new Map(),
  consolidatedData,
}: ExpandableStudentAttendanceTableProps) {
  const [expandedStudents, setExpandedStudents] = useState<Set<number>>(new Set());

  const toggleExpanded = (enrollmentId: number) => {
    const newExpanded = new Set(expandedStudents);
    if (newExpanded.has(enrollmentId)) {
      newExpanded.delete(enrollmentId);
    } else {
      newExpanded.add(enrollmentId);
    }
    setExpandedStudents(newExpanded);
  };

  const getStatusColor = (colorCode?: string): string => {
    if (!colorCode) return '#808080';
    if (/^#[0-9A-F]{6}$/i.test(colorCode)) {
      return colorCode;
    }
    const colorMap: Record<string, string> = {
      'green': '#10b981',
      'red': '#ef4444',
      'blue': '#3b82f6',
      'yellow': '#f59e0b',
      'purple': '#a855f7',
    };
    return colorMap[colorCode] || '#808080';
  };

  return (
    <div className="rounded-lg border border-gray-300 overflow-hidden shadow-md bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-blue-600 to-blue-700">
            <TableHead className="w-10 text-white">
              <span className="text-xs font-bold">▼</span>
            </TableHead>
            <TableHead className="text-white font-bold">Estudiante</TableHead>
            <TableHead className="text-white font-bold">Matrícula</TableHead>
            <TableHead className="w-56 text-white font-bold">Estado</TableHead>
            <TableHead className="w-32 text-center text-white font-bold">Salida Temprana</TableHead>
            <TableHead className="w-32 text-center text-white font-bold">Estatus</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student, index) => {
            const enrollmentId = student.enrollmentId as number;
            const attendance = studentAttendance.get(enrollmentId);
            const studentName = student.name || 'Sin nombre';
            const hasExistingRecord = existingAttendance.has(enrollmentId);
            const isExpanded = expandedStudents.has(enrollmentId);

            // Obtener cursos del estudiante desde consolidatedData si existe
            const consolidatedStudent = consolidatedData?.students.find(
              s => s.enrollmentId === enrollmentId
            );
            const hasCourses = consolidatedStudent && consolidatedStudent.courses.length > 0;

            // Obtener color del estado del primer curso si existe
            let rowBackgroundStyle: React.CSSProperties | undefined;
            if (hasExistingRecord && consolidatedStudent && consolidatedStudent.courses.length > 0) {
              const firstCourse = consolidatedStudent.courses[0];
              const statusObj = allowedStatuses.find(s => s.code === firstCourse.currentStatus);
              const statusColor = statusObj?.colorCode || '#808080';
              // Crear un color de fondo más visible (opacity 0.35)
              rowBackgroundStyle = {
                backgroundColor: statusColor,
                opacity: 0.35,
              };
            }

            return (
              <Fragment key={`student-${enrollmentId}`}>
                {/* Fila principal del estudiante */}
                <TableRow
                  style={rowBackgroundStyle}
                  className="border-b border-gray-200 hover:bg-blue-50 transition-colors"
                >
                  <TableCell className="w-10 text-center py-3">
                    {hasCourses && (
                      <button
                        onClick={() => toggleExpanded(enrollmentId)}
                        className="p-1 hover:bg-blue-100 rounded-md transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-blue-600" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-blue-600" />
                        )}
                      </button>
                    )}
                  </TableCell>
                  <TableCell className="font-bold text-gray-900 py-3">
                    {studentName}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 py-3 font-medium">
                    {student.enrollmentNumber || `#${enrollmentId}`}
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="bg-white rounded-lg border border-gray-300 p-2">
                      <AttendanceStatusSelector
                        enrollmentId={enrollmentId}
                        value={attendance?.status || ''}
                        onChange={onStatusChange}
                        allowedStatuses={allowedStatuses}
                        disabled={isLoading}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <div className="flex justify-center">
                      <Checkbox
                        checked={attendance?.isEarlyExit || false}
                        onCheckedChange={(checked) =>
                          onEarlyExitToggle(enrollmentId, checked as boolean)
                        }
                        disabled={isLoading || !attendance?.status}
                        className="h-5 w-5 cursor-pointer"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    {hasExistingRecord && (
                      <div className="flex items-center justify-center gap-1 bg-green-100 text-green-700 font-bold text-xs px-3 py-1 rounded-full w-fit mx-auto">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Registrado</span>
                      </div>
                    )}
                  </TableCell>
                </TableRow>

                {/* Filas expandidas con detalles de cursos */}
                {isExpanded && consolidatedStudent && (
                  consolidatedStudent.courses.map((course, courseIdx) => {
                    const originalStatus = allowedStatuses.find(
                      s => s.code === course.originalStatus
                    );
                    const currentStatus = allowedStatuses.find(
                      s => s.code === course.currentStatus
                    );
                    const hasChanged = course.originalStatus !== course.currentStatus;

                    return (
                      <TableRow
                        key={`${enrollmentId}-course-${courseIdx}`}
                        className={`bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 ${
                          hasChanged ? 'border-l-4 border-amber-500 from-amber-50 to-amber-100' : ''
                        }`}
                      >
                        <TableCell />
                        <TableCell className="pl-12 py-3">
                          <span className="font-semibold text-gray-900 text-sm">
                            📚 {course.courseName}
                          </span>
                        </TableCell>
                        <TableCell />
                        <TableCell className="py-3">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <span className="text-gray-600 text-xs font-bold uppercase tracking-wide">Original:</span>
                              <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-gray-300">
                                {originalStatus?.colorCode && (
                                  <div
                                    className="h-3 w-3 rounded-full flex-shrink-0"
                                    style={{
                                      backgroundColor: getStatusColor(originalStatus.colorCode),
                                    }}
                                  />
                                )}
                                <span className="text-gray-700 text-xs font-medium">
                                  {course.originalStatusName || 'N/A'}
                                </span>
                              </div>
                            </div>
                            {hasChanged && (
                              <div className="flex items-center gap-3">
                                <span className="text-amber-600 text-xs font-bold uppercase tracking-wide">Actual:</span>
                                <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border-2 border-amber-400">
                                  {currentStatus?.colorCode && (
                                    <div
                                      className="h-3 w-3 rounded-full flex-shrink-0"
                                      style={{
                                        backgroundColor: getStatusColor(currentStatus.colorCode),
                                      }}
                                    />
                                  )}
                                  <span className="text-amber-900 font-bold text-xs">
                                    {course.currentStatusName}
                                  </span>
                                </div>
                                <span className="text-amber-600 font-bold text-xs">⚠️ Cambió</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell />
                        <TableCell>
                          {hasChanged && (
                            <div className="flex items-center gap-1 rounded bg-amber-100 px-2 py-1 text-amber-800 text-xs font-medium">
                              <AlertCircle className="h-3 w-3" />
                              <span>Cambió</span>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
