'use client';

import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Edit2 } from 'lucide-react';
import {
  useAttendance,
  useAttendanceConfig,
  useAttendanceUtils,
  useAttendancePermissions,
} from '@/hooks/attendance-hooks';
import { StudentAttendanceWithRelations } from '@/types/attendance.types';
import { toast } from 'sonner';

interface AttendanceTableProps {
  data: StudentAttendanceWithRelations[];
  selectedDate: Date;
  readOnly?: boolean;
}

/**
 * AttendanceTable Component - FASE 3
 * Displays attendance records with edit capabilities
 */
export default function AttendanceTable({
  data,
  selectedDate,
  readOnly = false,
}: AttendanceTableProps) {
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());

  // Get mutation hooks
  const { useUpdateAttendance } = useAttendance();
  const { mutate: updateAttendance, isPending } = useUpdateAttendance();

  // Get config and utils
  const { useAttendanceStatuses } = useAttendanceConfig();
  const { data: statuses = [] } = useAttendanceStatuses();

  const { getStatusColor } = useAttendanceUtils();

  const { canUpdate } = useAttendancePermissions();

  // Sort data
  const sortedData = useMemo(
    () => [...data].sort((a, b) => (a.studentName || '').localeCompare(b.studentName || '')),
    [data]
  );

  const handleStatusChange = (
    enrollmentId: number,
    newStatusId: number,
    reason?: string
  ) => {
    if (!canUpdate || readOnly) return;

    setUpdatingIds((prev) => new Set(prev).add(enrollmentId));

    updateAttendance(
      {
        id: enrollmentId,
        attendanceStatusId: newStatusId,
        changeReason: reason || 'Manual update',
        date: selectedDate.toISOString(),
      },
      {
        onSuccess: () => {
          toast.success('Asistencia actualizada');
          setUpdatingIds((prev) => {
            const next = new Set(prev);
            next.delete(enrollmentId);
            return next;
          });
        },
        onError: (error) => {
          toast.error('Error al actualizar asistencia');
          setUpdatingIds((prev) => {
            const next = new Set(prev);
            next.delete(enrollmentId);
            return next;
          });
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Registros de Asistencia ({sortedData.length} estudiantes)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante</TableHead>
                <TableHead>Grado - Sección</TableHead>
                <TableHead>Estado Actual</TableHead>
                <TableHead>Cambiar Estado</TableHead>
                {!readOnly && <TableHead>Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((record) => {
                const currentStatus = statuses.find((s) => s.id === record.attendanceStatusId);
                const isUpdating = updatingIds.has(record.enrollmentId);

                return (
                  <TableRow key={record.enrollmentId}>
                    <TableCell className="font-medium">{record.studentName}</TableCell>
                    <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                      {record.grade?.name} - {record.section?.name}
                    </TableCell>
                    <TableCell>
                      {currentStatus && (
                        <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30">
                          {currentStatus.code}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {!readOnly ? (
                        <div className="flex gap-1 flex-wrap">
                          {statuses.slice(0, 4).map((status) => {
                            const isActive = status.id === record.attendanceStatusId;
                            return (
                              <Button
                                key={status.id}
                                variant={isActive ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleStatusChange(record.enrollmentId, status.id)}
                                disabled={isUpdating || isPending}
                              >
                                {isUpdating ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  status.code
                                )}
                              </Button>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">Solo lectura</span>
                      )}
                    </TableCell>
                    {!readOnly && (
                      <TableCell>
                        <Button variant="ghost" size="sm" disabled>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
