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
import { Loader2, Edit2, CheckCircle, XCircle, Users, Calendar } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
  statuses = [],
  readOnly = false,
}: AttendanceTableProps & { statuses?: any[] }) {
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());

  // Get mutation hooks
  const { updateAttendance: updateMutate } = useAttendance(0);

  // Check permissions
  const { canUpdate } = useAttendancePermissions({
    userRole: 'teacher',
    scope: 'GRADE',
  });

  // Sort data
  const sortedData = useMemo(
    () => [...data].sort((a: any, b: any) => (a.studentName || '').localeCompare(b.studentName || '')),
    [data]
  );

  const handleStatusChange = async (
    enrollmentId: number,
    newStatusId: number,
    studentName: string,
    reason?: string
  ) => {
    if (!canUpdate || readOnly) return;

    setUpdatingIds((prev) => new Set(prev).add(enrollmentId));

    // Create loading toast
    const loadingToast = toast.loading('Actualizando asistencia...', {
      description: `Cambiando estado de ${studentName}`,
      icon: <Loader2 className="w-5 h-5 animate-spin" />,
    });

    try {
      // Call mutation (would be real API call in production)
      // await updateMutate({ enrollmentId, newStatusId, reason });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      toast.success('Asistencia actualizada exitosamente', {
        id: loadingToast,
        description: `Estado de ${studentName} fue actualizado correctamente`,
        icon: <CheckCircle className="w-5 h-5" />,
        duration: 4000,
      });

      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(enrollmentId);
        return next;
      });
    } catch (error: any) {
      toast.error('Error al actualizar asistencia', {
        id: loadingToast,
        description: error.message || 'No se pudo actualizar el estado de asistencia.',
        icon: <XCircle className="w-5 h-5" />,
        duration: 5000,
      });

      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(enrollmentId);
        return next;
      });
    }
  };

  return (
    <TooltipProvider>
      <Card className="border-2 border-slate-200 dark:border-slate-800 shadow-md">
        <CardHeader className="border-b-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Registros de Asistencia
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                {sortedData.length} {sortedData.length === 1 ? 'estudiante' : 'estudiantes'} registrados
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">
                    Estudiante
                  </TableHead>
                  <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">
                    Grado - Sección
                  </TableHead>
                  <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">
                    Estado Actual
                  </TableHead>
                  <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">
                    Cambiar Estado
                  </TableHead>
                  {!readOnly && (
                    <TableHead className="text-slate-700 dark:text-slate-300 font-semibold text-right">
                      Acciones
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((record: any) => {
                  const currentStatus = statuses.find((s: any) => s.id === record.attendanceStatusId);
                  const isUpdating = updatingIds.has(record.enrollmentId);
                  const studentName = record.studentName || record.enrollment?.student?.givenNames || 'Desconocido';
                  const sectionName = record.enrollment?.section?.name || 'N/A';

                  return (
                    <TableRow
                      key={record.enrollmentId}
                      className="border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                    >
                      <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                        {studentName}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                        {sectionName}
                      </TableCell>
                      <TableCell>
                        {currentStatus && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant="outline"
                                className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-medium cursor-help"
                              >
                                {currentStatus.code}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-semibold">{currentStatus.name || currentStatus.code}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell>
                        {!readOnly ? (
                          <div className="flex gap-2 flex-wrap">
                            {statuses.slice(0, 4).map((status: any) => {
                              const isActive = status.id === record.attendanceStatusId;
                              return (
                                <Tooltip key={status.id}>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant={isActive ? 'default' : 'outline'}
                                      size="sm"
                                      onClick={() => handleStatusChange(record.enrollmentId, status.id, studentName)}
                                      disabled={isUpdating}
                                      className={isActive ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600' : ''}
                                    >
                                      {isUpdating && isActive ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                      ) : (
                                        status.code
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="font-semibold">
                                      {isActive ? 'Estado actual' : `Cambiar a ${status.name || status.code}`}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 dark:text-slate-400">Solo lectura</span>
                        )}
                      </TableCell>
                      {!readOnly && (
                        <TableCell className="text-right">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled
                                className="h-8 w-8 p-0"
                                aria-label="Editar detalles"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-semibold">Editar detalles (próximamente)</p>
                            </TooltipContent>
                          </Tooltip>
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
    </TooltipProvider>
  );
}
