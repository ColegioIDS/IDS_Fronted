/**
 * TABLA DE ESTUDIANTES PARA REGISTRO DE ASISTENCIA
 * Muestra lista de estudiantes con selector de estado
 */

'use client';

import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AttendanceStatusSelector } from './AttendanceStatusSelector';
import { AttendanceStatus } from '@/types/attendance.types';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StudentData {
  id?: number;
  name?: string;
  enrollmentId: number;
  enrollmentNumber?: string;
  email?: string;
  identificationNumber?: string;
}

interface StudentAttendanceProps {
  students: StudentData[];
  studentAttendance: Map<number, { enrollmentId: number; status: string; isEarlyExit: boolean }>;
  onStatusChange: (enrollmentId: number, status: string) => void;
  onEarlyExitToggle: (enrollmentId: number, isEarlyExit: boolean) => void;
  allowedStatuses?: AttendanceStatus[];
  isLoading?: boolean;
  existingAttendance?: Map<number, { statusId: number; isEarlyExit: boolean }>;
}

export function StudentAttendanceTable({
  students,
  studentAttendance,
  onStatusChange,
  onEarlyExitToggle,
  allowedStatuses,
  isLoading = false,
  existingAttendance = new Map(),
}: StudentAttendanceProps) {
  return (
    <div className="rounded-md border bg-card text-card-foreground shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-[50px] text-center font-semibold text-foreground">N°</TableHead>
            <TableHead className="font-semibold text-foreground">Estudiante</TableHead>
            <TableHead className="font-semibold text-foreground">Matrícula</TableHead>
            <TableHead className="w-[280px] font-semibold text-foreground">Estado</TableHead>
            <TableHead className="w-[150px] text-center font-semibold text-foreground">Salida Temprana</TableHead>
            <TableHead className="w-[150px] text-center font-semibold text-foreground">Estatus</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student, index) => {
            const enrollmentId = student.enrollmentId as number;
            const attendance = studentAttendance.get(enrollmentId);
            const studentName = student.name || 'Sin nombre';
            const hasExistingRecord = existingAttendance.has(enrollmentId);

            return (
              <TableRow 
                key={enrollmentId} 
                className={cn(
                  "transition-colors hover:bg-muted/50",
                  hasExistingRecord && "bg-green-50/50 dark:bg-green-900/10"
                )}
              >
                <TableCell className="text-center font-medium text-muted-foreground">
                  {index + 1}
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{studentName}</span>
                    {student.email && (
                       <span className="text-xs text-muted-foreground hidden sm:inline-block">{student.email}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono font-normal text-xs">
                    {student.enrollmentNumber || `#${enrollmentId}`}
                  </Badge>
                </TableCell>
                <TableCell>
                  <AttendanceStatusSelector
                    enrollmentId={enrollmentId}
                    value={attendance?.status || ''}
                    onChange={onStatusChange}
                    allowedStatuses={allowedStatuses}
                    disabled={isLoading}
                  />
                </TableCell>
                <TableCell>
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
                <TableCell className="text-center">
                  {hasExistingRecord && (
                    <Badge variant="secondary" className="gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 border-0">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Registrado
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
