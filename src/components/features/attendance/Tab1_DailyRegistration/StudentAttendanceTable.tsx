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
import { AttendanceStatusSelector } from './AttendanceStatusSelector';
import { AttendanceStatus } from '@/types/attendance.types';

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
}

export function StudentAttendanceTable({
  students,
  studentAttendance,
  onStatusChange,
  onEarlyExitToggle,
  allowedStatuses,
  isLoading = false,
}: StudentAttendanceProps) {
  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-12">N°</TableHead>
            <TableHead>Estudiante</TableHead>
            <TableHead>Matrícula</TableHead>
            <TableHead className="w-48">Estado</TableHead>
            <TableHead className="w-24">Salida Temprana</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student, index) => {
            const enrollmentId = student.enrollmentId as number;
            const attendance = studentAttendance.get(enrollmentId);
            const studentName = student.name || 'Sin nombre';

            return (
              <TableRow key={enrollmentId} className="hover:bg-gray-50">
                <TableCell className="text-sm font-medium text-gray-600">
                  {index + 1}
                </TableCell>
                <TableCell className="font-medium text-gray-900">
                  {studentName}
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {student.enrollmentNumber || `#${enrollmentId}`}
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
                  <Checkbox
                    checked={attendance?.isEarlyExit || false}
                    onCheckedChange={(checked) =>
                      onEarlyExitToggle(enrollmentId, checked as boolean)
                    }
                    disabled={isLoading || !attendance?.status}
                    className="h-5 w-5"
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
