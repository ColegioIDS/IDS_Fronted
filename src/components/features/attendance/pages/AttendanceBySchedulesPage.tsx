// src/components/features/attendance/pages/AttendanceBySchedulesPage.tsx

'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Calendar, Loader2, AlertCircle, Save, RotateCcw } from 'lucide-react';

import { Schedule, BulkBySchedulesAttendanceItem } from '@/types/attendance.types';
import { useAttendanceStatuses } from '@/hooks/attendance';

import { ScheduleList } from '../components/schedules/ScheduleList';
import { QuickStatusBar } from '../components/schedules/QuickStatusBar';
import { AttendanceGridBySchedules } from '../components/schedules/AttendanceGridBySchedules';

interface StudentRecord {
  enrollmentId: number;
  studentName: string;
  [scheduleId: number]: number | null;
}

interface AttendanceBySchedulesPageProps {
  sectionId: number;
  selectedDate: Date;
  students: Array<{ enrollmentId: number; studentName: string }>;
  onClose?: () => void;
  onSuccess?: () => void;
}

/**
 * ✅ NUEVA PÁGINA: Asistencia por Horarios
 *
 * Flujo:
 * 1. Carga horarios del día
 * 2. Maestro selecciona qué horarios marcar
 * 3. Muestra grid de estudiantes × horarios
 * 4. Maestro marca asistencia para cada celda
 * 5. Guarda TODO en una sola petición (bulk-by-schedules)
 */
export function AttendanceBySchedulesPage({
  sectionId,
  selectedDate,
  students,
  onClose,
  onSuccess,
}: AttendanceBySchedulesPageProps) {
  const { schedules, loading: schedulesLoading, error: schedulesError, fetchSchedules } =
    useSchedulesForDay();
  const { bulkBySchedules, loading: submitting, error: submitError } = useAttendanceActions();
  const { statuses } = useAttendanceStatuses();

  // Estados locales
  const [selectedScheduleIds, setSelectedScheduleIds] = useState<number[]>([]);
  const [quickStatusId, setQuickStatusId] = useState<number | null>(null);
  const [attendanceData, setAttendanceData] = useState<
    Record<number, Record<number, number | null>>
  >({});
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());

  // Cargar horarios al montar el componente
  useEffect(() => {
    if (sectionId) {
      fetchSchedules(sectionId, selectedDate);
    }
  }, [sectionId, selectedDate, fetchSchedules]);

  // Inicializar estructura de datos de asistencia
  useEffect(() => {
    const initial: Record<number, Record<number, number | null>> = {};
    students.forEach((student) => {
      initial[student.enrollmentId] = {};
      schedules.forEach((schedule) => {
        initial[student.enrollmentId][schedule.id] = null;
      });
    });
    setAttendanceData(initial);
  }, [students, schedules]);

  // Convertir datos a formato para el grid
  const gridStudents = useMemo<StudentRecord[]>(() => {
    return students.map((student) => ({
      enrollmentId: student.enrollmentId,
      studentName: student.studentName,
      ...attendanceData[student.enrollmentId],
    }));
  }, [students, attendanceData]);

  // Manejar cambio de asistencia en una celda
  const handleAttendanceChange = useCallback(
    (enrollmentId: number, scheduleId: number, statusId: number) => {
      setAttendanceData((prev) => ({
        ...prev,
        [enrollmentId]: {
          ...prev[enrollmentId],
          [scheduleId]: statusId,
        },
      }));
    },
    []
  );

  // Contar registros completados
  const completedCount = useMemo(() => {
    let count = 0;
    Object.values(attendanceData).forEach((studentData) => {
      Object.values(studentData).forEach((statusId) => {
        if (statusId !== null) count++;
      });
    });
    return count;
  }, [attendanceData]);

  const totalCells = students.length * schedules.length;
  const progressPercent = totalCells > 0 ? Math.round((completedCount / totalCells) * 100) : 0;

  // Guardar asistencia (enviar bulk-by-schedules)
  const handleSaveAttendance = useCallback(async () => {
    if (selectedScheduleIds.length === 0) {
      toast.error('Selecciona al menos un horario', {
        description: 'Debes seleccionar uno o más horarios para registrar asistencia',
      });
      return;
    }

    // Construir payload de asistencias
    const attendances: BulkBySchedulesAttendanceItem[] = [];

    students.forEach((student) => {
      selectedScheduleIds.forEach((scheduleId) => {
        const statusId = attendanceData[student.enrollmentId]?.[scheduleId];
        if (statusId !== null && statusId !== undefined) {
          attendances.push({
            enrollmentId: student.enrollmentId,
            attendanceStatusId: statusId,
          });
        }
      });
    });

    if (attendances.length === 0) {
      toast.error('No hay asistencias para guardar', {
        description: 'Marca asistencia para al menos un estudiante en un horario',
      });
      return;
    }

    const formattedDate = selectedDate.toISOString().split('T')[0];

    try {
      const loadingToast = toast.loading('Guardando asistencia...');

      const response = await bulkBySchedules({
        date: formattedDate,
        scheduleIds: selectedScheduleIds,
        attendances,
      });

      if (response.success) {
        toast.success('✅ Asistencia guardada exitosamente', {
          id: loadingToast,
          description: `${response.data?.totalRecords || attendances.length} registros creados`,
        });

        // Limpiar datos
        setAttendanceData({});
        setQuickStatusId(null);

        // Callback
        if (onSuccess) onSuccess();
      } else {
        toast.error('Error al guardar asistencia', {
          id: loadingToast,
          description: response.message,
        });
      }
    } catch (error) {
      toast.error('Error al guardar asistencia', {
        description: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  }, [selectedScheduleIds, attendanceData, students, selectedDate, bulkBySchedules, onSuccess]);

  // Limpiar formulario
  const handleClear = useCallback(() => {
    setAttendanceData({});
    setQuickStatusId(null);
    toast.info('Formulario limpiado');
  }, []);

  // Mostrar error de carga de horarios
  if (schedulesError) {
    return (
      <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800 dark:text-red-200">
          Error al cargar horarios: {schedulesError}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Encabezado */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Asistencia por Horarios
          </h1>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Fecha: {selectedDate.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Selector de Horarios */}
      <ScheduleList
        schedules={schedules}
        selectedScheduleIds={selectedScheduleIds}
        onSelectionChange={setSelectedScheduleIds}
        loading={schedulesLoading}
        error={schedulesError}
        date={selectedDate}
      />

      {/* Barra Rápida de Estados */}
      <QuickStatusBar
        selectedStatusId={quickStatusId}
        onStatusSelect={setQuickStatusId}
        disabled={submitting}
      />

      {/* Grid de Asistencia */}
      <AttendanceGridBySchedules
        schedules={schedules.filter((s) => selectedScheduleIds.includes(s.id))}
        students={gridStudents}
        loading={schedulesLoading}
        onAttendanceChange={handleAttendanceChange}
        quickStatusId={quickStatusId}
        updatingIds={updatingIds}
      />

      {/* Información de Progreso */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Progreso: {completedCount}/{totalCells} celdas completadas
              </span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {progressPercent}%
              </span>
            </div>

            {/* Barra de progreso */}
            <div className="w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="text-xs text-gray-600 dark:text-gray-400">
              • Estudiantes: {students.length}
              <br />
              • Horarios seleccionados: {selectedScheduleIds.length}
              <br />
              • Registros a enviar: {completedCount}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botones de Acción */}
      <div className="flex gap-3 justify-end">
        <Button
          variant="outline"
          onClick={handleClear}
          disabled={submitting || completedCount === 0}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Limpiar
        </Button>

        {onClose && (
          <Button
            variant="outline"
            onClick={onClose}
            disabled={submitting}
          >
            Cerrar
          </Button>
        )}

        <Button
          onClick={handleSaveAttendance}
          disabled={submitting || completedCount === 0}
          className="gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Guardar Asistencia ({completedCount})
            </>
          )}
        </Button>
      </div>

      {/* Mensaje de error al enviar */}
      {submitError && (
        <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            {submitError}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
