'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Check, X, Clock, ChevronDown, ChevronUp, Grid3x3, List, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useAttendanceStatuses } from '@/hooks/attendance/useAttendanceStatuses';

// Mapeo de iconos por código
const ICON_MAP: Record<string, React.ReactNode> = {
  'P': <Check className="w-4 h-4" />,
  'I': <X className="w-4 h-4" />,
  'TI': <Clock className="w-4 h-4" />,
  'TJ': <Clock className="w-4 h-4" />,
  'IJ': <X className="w-4 h-4" />,
};

interface ClassAttendance {
  id: string;
  scheduleId: string;
  className: string;
  startTime: string;
  endTime: string;
  attendanceStatusId: string;
  status: string;
  arrivalTime?: string | null;
  notes?: string | null;
}

interface Student {
  id: string;
  enrollmentId: string;
  studentId: string;
  studentName: string;
  date: string;
  status: string;
  arrivalTime?: string | null;
  departureTime?: string | null;
  notes?: string | null;
  isEarlyExit?: boolean;
  classAttendances: ClassAttendance[];
}

interface AttendanceTableWithToggleProps {
  data: Student[];
  selectedDate: Date;
  onStatusChange?: (enrollmentId: string, statusId: string, studentName: string) => Promise<void>;
}

type ViewMode = 'simple' | 'detailed';

export default function AttendanceTableWithToggle({
  data,
  selectedDate,
  onStatusChange,
}: AttendanceTableWithToggleProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('simple');
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<Set<string>>(new Set());

  const { statuses } = useAttendanceStatuses();

  // Mapeo de status string a ID numérico
  const getStatusIdByString = (statusString: string): string | null => {
    if (!statusString) return null;
    
    // Mapeo de valores backend a IDs
    const statusMap: Record<string, number> = {
      'PRESENT': 1,
      'P': 1,
      'ABSENT': 2,
      'I': 2,
      'TARDY': 3,
      'TI': 3,
      'EXCUSED_TARDY': 4,
      'TJ': 4,
      'EXCUSED_ABSENT': 5,
      'IJ': 5,
    };
    
    const id = statusMap[statusString.toUpperCase()];
    return id !== undefined ? String(id) : null;
  };

  // Para encontrar el status object por su nombre o código
  const getStatusByNameOrCode = (value: string): any => {
    return statuses.find(s => 
      s.name?.toUpperCase() === value?.toUpperCase() || 
      s.code?.toUpperCase() === value?.toUpperCase()
    );
  };

  React.useEffect(() => {
    console.log('[AttendanceTableWithToggle] 📊 Estatuses disponibles:', statuses.map(s => ({ id: s.id, code: s.code, name: s.name })));
    if (data && data.length > 0) {
      console.log('[AttendanceTableWithToggle] 📊 Data recibida:', data);
      console.log('[AttendanceTableWithToggle] 📊 Primer registro:', JSON.stringify(data[0], null, 2));
    } else {
      console.log('[AttendanceTableWithToggle] 📊 Data recibida: []');
    }
  }, [statuses, data]);

  const getIconForStatus = (code: string) => {
    return ICON_MAP[code] || <Check className="w-4 h-4" />;
  };

  const hexToRgba = (hex: string, alpha: number = 0.1): string => {
    if (!hex) return 'rgba(229, 231, 235, 0.1)';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const toggleExpanded = (enrollmentId: string) => {
    const newExpanded = new Set(expandedStudents);
    if (newExpanded.has(enrollmentId)) {
      newExpanded.delete(enrollmentId);
    } else {
      newExpanded.add(enrollmentId);
    }
    setExpandedStudents(newExpanded);
  };

  const handleStatusChange = async (enrollmentId: string, statusId: string, studentName: string) => {
    console.log('[AttendanceTableWithToggle] 🖱️ CLICK EN BOTÓN:', {
      enrollmentId,
      statusId,
      studentName,
    });

    setLoading((prev) => new Set(prev).add(enrollmentId));

    try {
      if (onStatusChange) {
        console.log('[AttendanceTableWithToggle] 📤 Llamando onStatusChange...');
        await onStatusChange(enrollmentId, statusId, studentName);
        console.log('[AttendanceTableWithToggle] ✅ onStatusChange completado EXITOSAMENTE');
      } else {
        throw new Error('No hay callback para cambiar estado');
      }

      const status = statuses.find((s) => s.id === statusId);
      console.log('[AttendanceTableWithToggle] 🎉 Mostrando toast de éxito');
      toast.success(`${studentName}: ${status?.name}`, {
        description: 'Asistencia registrada correctamente',
      });
    } catch (error: any) {
      console.error('[AttendanceTableWithToggle] ❌ Error capturado:', error);

      let errorMessage = 'Error al registrar asistencia';

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.details) {
        const details = Array.isArray(error.response.data.details)
          ? error.response.data.details.join(', ')
          : error.response.data.details;
        errorMessage = details;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      console.log('[AttendanceTableWithToggle] 🚨 Mostrando toast de error:', errorMessage);
      toast.error(errorMessage);
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

  // Estadísticas
  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    statuses.forEach(s => {
      counts[s.id] = 0;
    });

    data.forEach(student => {
      const statusId = student.status;
      if (counts.hasOwnProperty(statusId)) {
        counts[statusId]++;
      }
    });

    return counts;
  }, [data, statuses]);

  return (
    <Card className="border-2 border-slate-200 dark:border-slate-800 shadow-md">
      <CardHeader className="border-b-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 pb-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
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

          {/* Toggle View Mode */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={viewMode === 'simple' ? 'default' : 'outline'}
              onClick={() => setViewMode('simple')}
              className="gap-2"
              title="Vista simple"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Simple</span>
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'detailed' ? 'default' : 'outline'}
              onClick={() => setViewMode('detailed')}
              className="gap-2"
              title="Vista detallada"
            >
              <Grid3x3 className="w-4 h-4" />
              <span className="hidden sm:inline">Detallada</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Instruction */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-700 dark:text-blue-300">
            💡 {viewMode === 'simple'
              ? 'Selecciona el estado de asistencia para cada estudiante'
              : 'Expande un estudiante para ver la asistencia por clase'}
          </div>

          {/* Students List */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {data.map((student) => {
              const statusInfo = statuses.find((s) => s.id === student.status);
              const isExpanded = expandedStudents.has(student.enrollmentId);

              return (
                <div key={student.enrollmentId} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                  {/* Main Row */}
                  <div className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
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
                      <div
                        className="mr-3 px-3 py-1 rounded-full font-semibold text-sm flex items-center gap-1"
                        style={{
                          backgroundColor: hexToRgba(statusInfo.colorCode, 0.2),
                          color: statusInfo.colorCode,
                          borderLeft: `3px solid ${statusInfo.colorCode}`,
                        }}
                      >
                        {getIconForStatus(statusInfo.code)}
                        {statusInfo.name}
                      </div>
                    )}

                    {/* Status Buttons or Expand Button */}
                    {viewMode === 'simple' ? (
                      <div className="flex gap-2">
                        {statuses.map((status) => {
                          // Convertir status string del backend a ID para comparar
                          const studentStatusId = getStatusIdByString(student.status);
                          const isSelected = String(status.id) === studentStatusId;
                          return (
                            <Button
                              key={status.id}
                              size="sm"
                              variant={isSelected ? 'default' : 'outline'}
                              onClick={() =>
                                handleStatusChange(student.enrollmentId, String(status.id), student.studentName)
                              }
                              disabled={loading.has(student.enrollmentId)}
                              className="gap-1"
                              title={status.name}
                              style={
                                isSelected
                                  ? {
                                      backgroundColor: status.colorCode,
                                      borderColor: status.colorCode,
                                      color: '#fff',
                                    }
                                  : {
                                      borderColor: status.colorCode,
                                      color: status.colorCode,
                                    }
                              }
                            >
                              {getIconForStatus(status.code)}
                              <span className="hidden sm:inline">{status.name}</span>
                            </Button>
                          );
                        })}
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleExpanded(student.enrollmentId)}
                        className="gap-2"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                        <span className="hidden sm:inline">{isExpanded ? 'Ocultar' : 'Ver'} clases</span>
                      </Button>
                    )}
                  </div>

                  {/* Expanded Details - Classes */}
                  {viewMode === 'detailed' && isExpanded && (
                    <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/20 p-4">
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Asistencia por clase:
                        </p>
                        
                        {student.classAttendances && student.classAttendances.length > 0 ? (
                          <div className="space-y-2">
                            {student.classAttendances.map((classAttendance) => {
                              const classStatusInfo = statuses.find(
                                (s) => s.id === classAttendance.status
                              );
                              return (
                                <div
                                  key={classAttendance.id}
                                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <p className="font-medium text-slate-900 dark:text-slate-100">
                                        {classAttendance.className}
                                      </p>
                                      <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {classAttendance.startTime} - {classAttendance.endTime}
                                      </p>
                                      {classAttendance.arrivalTime && (
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                          Llegada: {classAttendance.arrivalTime}
                                        </p>
                                      )}
                                      {classAttendance.notes && (
                                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-1">
                                          <FileText className="w-3 h-3" /> {classAttendance.notes}
                                        </p>
                                      )}
                                    </div>
                                    {classStatusInfo && (
                                      <div
                                        className="px-2 py-1 rounded text-sm font-semibold flex items-center gap-1"
                                        style={{
                                          backgroundColor: hexToRgba(classStatusInfo.colorCode, 0.2),
                                          color: classStatusInfo.colorCode,
                                        }}
                                      >
                                        {getIconForStatus(classStatusInfo.code)}
                                        {classStatusInfo.name}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Sin clases registradas
                          </p>
                        )}

                        {/* Change Status for All Classes */}
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-600">
                          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                            Cambiar estado general:
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            {statuses.map((status) => {
                              const studentStatusId = getStatusIdByString(student.status);
                              const isSelected = String(status.id) === studentStatusId;
                              return (
                                <Button
                                  key={status.id}
                                  size="sm"
                                  variant={isSelected ? 'default' : 'outline'}
                                  onClick={() =>
                                    handleStatusChange(student.enrollmentId, String(status.id), student.studentName)
                                  }
                                  disabled={loading.has(student.enrollmentId)}
                                  className="gap-1 text-xs"
                                  title={status.name}
                                  style={
                                    isSelected
                                      ? {
                                          backgroundColor: status.colorCode,
                                          borderColor: status.colorCode,
                                          color: '#fff',
                                        }
                                      : {
                                          borderColor: status.colorCode,
                                          color: status.colorCode,
                                        }
                                  }
                                >
                                  {getIconForStatus(status.code)}
                                  {status.name}
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            {statuses.map((status) => {
              const count = stats[status.id] || 0;
              return (
                <div
                  key={status.id}
                  className="p-3 rounded-lg text-center font-semibold"
                  style={{
                    backgroundColor: hexToRgba(status.colorCode, 0.15),
                    color: status.colorCode,
                    border: `2px solid ${hexToRgba(status.colorCode, 0.5)}`,
                  }}
                >
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-xs">{status.name}</div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
