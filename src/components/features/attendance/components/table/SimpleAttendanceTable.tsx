'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Check, X, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface AttendanceStatus {
  id: number;
  name: string;
  color: string;
  icon: React.ReactNode;
}

const ATTENDANCE_STATUSES: AttendanceStatus[] = [
  { id: 1, name: 'Presente', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400', icon: <Check className="w-4 h-4" /> },
  { id: 2, name: 'Ausente', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400', icon: <X className="w-4 h-4" /> },
  { id: 3, name: 'Tarde', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400', icon: <Clock className="w-4 h-4" /> },
];

interface Student {
  enrollmentId: number;
  studentName: string;
  studentId?: number;
  [key: string]: any;
}

interface SimpleAttendanceTableProps {
  data: Student[];
  selectedDate: Date;
  onStatusChange?: (enrollmentId: number, statusId: number, studentName: string) => Promise<void>;
}

export default function SimpleAttendanceTable({
  data,
  selectedDate,
  onStatusChange,
}: SimpleAttendanceTableProps) {
  const [attendance, setAttendance] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState<Set<number>>(new Set());

  const handleStatusChange = async (enrollmentId: number, statusId: number, studentName: string) => {
    setLoading((prev) => new Set(prev).add(enrollmentId));

    try {
      // Call the callback if provided
      if (onStatusChange) {
        await onStatusChange(enrollmentId, statusId, studentName);
      }

      // Update local state
      setAttendance((prev) => ({
        ...prev,
        [enrollmentId]: statusId,
      }));

      const status = ATTENDANCE_STATUSES.find((s) => s.id === statusId);
      toast.success(`${studentName}: ${status?.name}`, {
        description: 'Asistencia registrada correctamente',
      });
    } catch (error) {
      toast.error('Error al registrar asistencia', {
        description: error instanceof Error ? error.message : 'Intenta de nuevo',
      });
    } finally {
      setLoading((prev) => {
        const next = new Set(prev);
        next.delete(enrollmentId);
        return next;
      });
    }
  };

  const dateFormatted = selectedDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Card className="border-2 border-slate-200 dark:border-slate-800 shadow-md">
      <CardHeader className="border-b-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 pb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Registro de Asistencia
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                {data.length} estudiante{data.length !== 1 ? 's' : ''} - {dateFormatted}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Instruction */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-700 dark:text-blue-300">
            💡 Selecciona el estado de asistencia para cada estudiante
          </div>

          {/* Students List */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {data.map((student, index) => {
              const currentStatus = attendance[student.enrollmentId];
              const statusInfo = currentStatus
                ? ATTENDANCE_STATUSES.find((s) => s.id === currentStatus)
                : null;

              return (
                <div
                  key={`${student.enrollmentId}-${index}`}
                  className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                      {(student.studentName?.[0] || '?').toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {student.studentName || 'Sin nombre'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Matrícula: {student.enrollmentId}
                      </p>
                    </div>
                  </div>

                  {/* Current Status */}
                  {statusInfo && (
                    <Badge className={`${statusInfo.color} mr-3 font-semibold`}>
                      {statusInfo.name}
                    </Badge>
                  )}

                  {/* Status Buttons */}
                  <div className="flex gap-2">
                    {ATTENDANCE_STATUSES.map((status) => (
                      <Button
                        key={status.id}
                        size="sm"
                        variant={currentStatus === status.id ? 'default' : 'outline'}
                        onClick={() =>
                          handleStatusChange(student.enrollmentId, status.id, student.studentName)
                        }
                        disabled={loading.has(student.enrollmentId)}
                        className="gap-1"
                        title={status.name}
                      >
                        {status.icon}
                        <span className="hidden sm:inline">{status.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            {ATTENDANCE_STATUSES.map((status) => {
              const count = Object.values(attendance).filter((s) => s === status.id).length;
              return (
                <div key={status.id} className={`p-3 rounded-lg text-center ${status.color}`}>
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-xs font-semibold">{status.name}</div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
