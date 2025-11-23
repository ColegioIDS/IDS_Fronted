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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  avatarUrl?: string;
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
  
  // Función para obtener iniciales
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="w-[50px] text-center font-semibold text-foreground">N°</TableHead>
            <TableHead className="font-semibold text-foreground pl-4">Estudiante</TableHead>
            <TableHead className="font-semibold text-foreground">Matrícula</TableHead>
            <TableHead className="w-[220px] font-semibold text-foreground">Estado</TableHead>
            <TableHead className="w-[140px] text-center font-semibold text-foreground">Salida Temprana</TableHead>
            <TableHead className="w-[140px] text-center font-semibold text-foreground">Estatus</TableHead>
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
                  "transition-all duration-200 hover:bg-muted/30",
                  hasExistingRecord && "bg-green-50/50 dark:bg-green-900/10"
                )}
              >
                <TableCell className="text-center font-medium text-muted-foreground py-4">
                  {index + 1}
                </TableCell>
                <TableCell className="py-4 pl-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-border/50">
                      <AvatarImage src={student.avatarUrl} alt={studentName} />
                      <AvatarFallback className="bg-primary/5 text-primary font-medium text-xs">
                        {getInitials(studentName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-foreground">{studentName}</span>
                      {student.email && (
                         <span className="text-xs text-muted-foreground hidden sm:inline-block">{student.email}</span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <Badge variant="outline" className="font-mono font-normal text-xs bg-background/50">
                    {student.enrollmentNumber || `#${enrollmentId}`}
                  </Badge>
                </TableCell>
                <TableCell className="py-4">
                  <AttendanceStatusSelector
                    enrollmentId={enrollmentId}
                    value={attendance?.status || ''}
                    onChange={onStatusChange}
                    allowedStatuses={allowedStatuses}
                    disabled={isLoading}
                  />
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex justify-center">
                    <Checkbox
                      checked={attendance?.isEarlyExit || false}
                      onCheckedChange={(checked) =>
                        onEarlyExitToggle(enrollmentId, checked as boolean)
                      }
                      disabled={isLoading || !attendance?.status}
                      className="h-5 w-5 rounded-md border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                  </div>
                </TableCell>
                <TableCell className="text-center py-4">
                  {hasExistingRecord && (
                    <Badge variant="secondary" className="gap-1.5 bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400 hover:bg-green-500/20 border-0 px-2.5 py-0.5">
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
