// src/components/features/attendance/components/schedules/AttendanceGridBySchedules.tsx

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Schedule } from '@/types/attendance.types';
import { useAttendanceStatuses } from '@/hooks/attendance';

interface StudentRecord {
  enrollmentId: number;
  studentName: string;
  [scheduleId: number]: number | null; // attendanceStatusId por schedule
}

interface AttendanceGridBySchedulesProps {
  schedules: Schedule[];
  students: StudentRecord[];
  loading?: boolean;
  onAttendanceChange: (enrollmentId: number, scheduleId: number, statusId: number) => void;
  quickStatusId?: number | null;
  updatingIds?: Set<number>;
}

const ITEMS_PER_PAGE = 10;

/**
 * Grid principal de asistencia: Estudiantes × Horarios
 * Permite ver y marcar asistencia para múltiples estudiantes en múltiples horarios
 */
export function AttendanceGridBySchedules({
  schedules,
  students,
  loading = false,
  onAttendanceChange,
  quickStatusId = null,
  updatingIds = new Set(),
}: AttendanceGridBySchedulesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const { statuses } = useAttendanceStatuses();

  // Filtrar estudiantes por búsqueda
  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;
    return students.filter((s) =>
      s.studentName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  // Paginar estudiantes
  const paginatedStudents = useMemo(() => {
    const start = currentPage * ITEMS_PER_PAGE;
    return filteredStudents.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredStudents, currentPage]);

  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);

  // Mapeo de status ID a código y color
  const statusMap = useMemo(() => {
    const map = new Map();
    statuses.forEach((status) => {
      map.set(status.id, {
        code: status.code,
        name: status.name,
        color: status.colorCode || '#6b7280',
      });
    });
    return map;
  }, [statuses]);

  const handleCellClick = useCallback(
    (enrollmentId: number, scheduleId: number) => {
      if (quickStatusId) {
        onAttendanceChange(enrollmentId, scheduleId, quickStatusId);
      }
    },
    [quickStatusId, onAttendanceChange]
  );

  const handleOpenStatusMenu = useCallback(
    (enrollmentId: number, scheduleId: number, statusId: number | null) => {
      // Implementar menú de selección de estados (modal o dropdown)
      // Por ahora, simplemente ciclar entre estados si hay modo rápido
      if (quickStatusId) {
        onAttendanceChange(enrollmentId, scheduleId, quickStatusId);
      }
    },
    [quickStatusId, onAttendanceChange]
  );

  const getStatusColor = (statusId: number | null) => {
    if (!statusId) return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';

    const status = statusMap.get(statusId);
    if (!status) return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';

    const colorHex = status.color;
    // Mapeo simple de colores
    const colorMap: Record<string, string> = {
      '#10b981': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
      '#ef4444': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      '#eab308': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
      '#3b82f6': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      '#8b5cf6': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      '#6366f1': 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
    };

    return colorMap[colorHex] || 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Cargando datos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (schedules.length === 0 || students.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p className="text-sm">No hay datos disponibles para mostrar</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar estudiante..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(0);
              }}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Grid Principal */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <CardTitle className="text-base">
            Cuadro de Asistencia ({paginatedStudents.length}/{filteredStudents.length} estudiantes)
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 sticky left-0 bg-gray-50 dark:bg-gray-900/50 z-10">
                  Estudiante
                </th>
                {schedules.map((schedule) => (
                  <th
                    key={schedule.id}
                    className="px-2 py-3 text-center font-semibold text-gray-700 dark:text-gray-300 min-w-[80px]"
                    title={`${schedule.startTime} - ${schedule.endTime}`}
                  >
                    <div className="text-xs">
                      <div className="font-bold">{schedule.startTime}</div>
                      <div className="text-gray-600 dark:text-gray-400 truncate max-w-[70px]">
                        {schedule.course?.name?.substring(0, 3) || 'N/A'}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {paginatedStudents.map((student, idx) => (
                <tr
                  key={student.enrollmentId}
                  className={`border-b border-gray-200 dark:border-gray-700 ${
                    idx % 2 === 0 ? '' : 'bg-gray-50 dark:bg-gray-900/20'
                  } hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors`}
                >
                  {/* Nombre del estudiante */}
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800 z-10">
                    <div className="truncate max-w-[200px]">{student.studentName}</div>
                  </td>

                  {/* Celdas de asistencia por horario */}
                  {schedules.map((schedule) => {
                    const statusId = student[schedule.id] || null;
                    const status = statusMap.get(statusId);
                    const isUpdating = updatingIds.has(student.enrollmentId);

                    return (
                      <td
                        key={`${student.enrollmentId}-${schedule.id}`}
                        className="px-2 py-3 text-center"
                      >
                        <button
                          onClick={() =>
                            handleCellClick(student.enrollmentId, schedule.id)
                          }
                          disabled={isUpdating}
                          className={`
                            w-full h-10 rounded-lg font-semibold transition-all
                            ${getStatusColor(statusId)}
                            ${isUpdating ? 'opacity-50 cursor-wait' : 'cursor-pointer hover:shadow-md'}
                          `}
                          title={status ? status.name : 'Sin marcar'}
                        >
                          {isUpdating ? (
                            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                          ) : (
                            <span className="text-xs sm:text-sm">
                              {status ? status.code : '—'}
                            </span>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Paginación */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Página {currentPage + 1} de {totalPages}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
