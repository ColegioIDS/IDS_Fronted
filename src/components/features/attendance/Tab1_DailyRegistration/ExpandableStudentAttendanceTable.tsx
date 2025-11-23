/**
 * TABLA EXPANDIBLE DE ESTUDIANTES CON CURSOS
 * Para TAB 1 - Muestra por estudiante sus cursos y cambios de estado
 */

'use client';

import { useState, Fragment } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  BookOpen, 
  History, 
  ArrowRight 
} from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
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
    <div className="rounded-md border bg-card text-card-foreground shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-[50px]"></TableHead>
            <TableHead className="font-semibold text-foreground">Estudiante</TableHead>
            <TableHead className="font-semibold text-foreground">Matrícula</TableHead>
            <TableHead className="w-[280px] font-semibold text-foreground">Estado</TableHead>
            <TableHead className="w-[150px] text-center font-semibold text-foreground">Salida Temprana</TableHead>
            <TableHead className="w-[150px] text-center font-semibold text-foreground">Estatus</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => {
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

            // Obtener color del estado del primer curso si existe para borde lateral
            let statusColorIndicator = 'transparent';
            if (hasExistingRecord && consolidatedStudent && consolidatedStudent.courses.length > 0) {
              const firstCourse = consolidatedStudent.courses[0];
              const statusObj = allowedStatuses.find(s => s.code === firstCourse.currentStatus);
              if (statusObj?.colorCode) {
                statusColorIndicator = getStatusColor(statusObj.colorCode);
              }
            }

            return (
              <Fragment key={`student-${enrollmentId}`}>
                {/* Fila principal del estudiante */}
                <TableRow 
                  className={cn(
                    "transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
                    isExpanded && "bg-muted/30 border-b-0"
                  )}
                  style={{ borderLeft: `4px solid ${statusColorIndicator}` }}
                >
                  <TableCell className="py-3 pl-2">
                    {hasCourses && (
                      <button
                        onClick={() => toggleExpanded(enrollmentId)}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </TableCell>
                  <TableCell className="font-medium py-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">{studentName}</span>
                      {student.email && (
                         <span className="text-xs text-muted-foreground hidden sm:inline-block">{student.email}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground py-3">
                    <Badge variant="outline" className="font-mono font-normal text-xs">
                      {student.enrollmentNumber || `#${enrollmentId}`}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3">
                    <AttendanceStatusSelector
                      enrollmentId={enrollmentId}
                      value={attendance?.status || ''}
                      onChange={onStatusChange}
                      allowedStatuses={allowedStatuses}
                      disabled={isLoading}
                    />
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex justify-center">
                      <Checkbox
                        checked={attendance?.isEarlyExit || false}
                        onCheckedChange={(checked) =>
                          onEarlyExitToggle(enrollmentId, checked as boolean)
                        }
                        disabled={isLoading || !attendance?.status}
                        className="h-5 w-5"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    {hasExistingRecord && (
                      <Badge variant="secondary" className="gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 border-0">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Registrado
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>

                {/* Filas expandidas con detalles de cursos */}
                {isExpanded && consolidatedStudent && (
                  <TableRow className="bg-muted/30 hover:bg-muted/30 border-t-0">
                    <TableCell colSpan={6} className="p-0">
                      <div className="px-4 pb-4 pt-2">
                        <div className="rounded-md border bg-background">
                          <Table>
                            <TableHeader>
                              <TableRow className="hover:bg-transparent border-b">
                                <TableHead className="w-[40px]"></TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground">Curso</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground">Estado Original</TableHead>
                                <TableHead className="text-xs font-semibold uppercase text-muted-foreground">Estado Actual</TableHead>
                                <TableHead className="w-[100px] text-right text-xs font-semibold uppercase text-muted-foreground">Cambios</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {consolidatedStudent.courses.map((course, courseIdx) => {
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
                                    className="hover:bg-muted/50 border-b last:border-0"
                                  >
                                    <TableCell className="py-2 text-center">
                                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                                    </TableCell>
                                    <TableCell className="py-2 font-medium text-sm">
                                      {course.courseName}
                                    </TableCell>
                                    <TableCell className="py-2">
                                      <div className="flex items-center gap-2">
                                        {originalStatus?.colorCode && (
                                          <div
                                            className="h-2.5 w-2.5 rounded-full ring-1 ring-offset-1 ring-offset-background"
                                            style={{
                                              backgroundColor: getStatusColor(originalStatus.colorCode),
                                              borderColor: getStatusColor(originalStatus.colorCode)
                                            }}
                                          />
                                        )}
                                        <span className="text-sm text-muted-foreground">
                                          {course.originalStatusName || 'N/A'}
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="py-2">
                                      <div className="flex items-center gap-2">
                                        {hasChanged && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                                        {currentStatus?.colorCode && (
                                          <div
                                            className="h-2.5 w-2.5 rounded-full ring-1 ring-offset-1 ring-offset-background"
                                            style={{
                                              backgroundColor: getStatusColor(currentStatus.colorCode),
                                              borderColor: getStatusColor(currentStatus.colorCode)
                                            }}
                                          />
                                        )}
                                        <span className={cn(
                                          "text-sm font-medium",
                                          hasChanged ? "text-foreground" : "text-muted-foreground"
                                        )}>
                                          {course.currentStatusName}
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="py-2 text-right">
                                      {hasChanged && (
                                        <Badge variant="outline" className="gap-1 border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
                                          <History className="h-3 w-3" />
                                          Modificado
                                        </Badge>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
