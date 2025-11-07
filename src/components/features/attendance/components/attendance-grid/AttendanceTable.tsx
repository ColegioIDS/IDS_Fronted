'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Search, Check, X, AlertCircle, Clock, Users, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { StudentAttendanceWithRelations, AttendanceStatusCode } from '@/types/attendance.types';
import { useAttendanceActions } from '@/hooks/attendance';

import { AttendanceStudentAvatar } from './StudentAvatar';
import HolidayNotice from '../attendance-states/HolidayNotice';
import { NoStudentsState, NoSearchResultsState } from '../attendance-states/EmptyState';
import BulkActions from '../attendance-controls/BulkActions';

interface AttendanceTableProps {
  sectionId?: number;
  selectedDate: Date;
  onDateChange?: (date: Date) => void;
  isHoliday?: boolean;
  holiday?: {
    id: number;
    date: Date | string;
    description: string;
    isRecovered: boolean;
  };
  data?: StudentAttendanceWithRelations[];
  loading?: boolean;
  error?: string | null;
}

const ATTENDANCE_CONFIG: Record<AttendanceStatusCode, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badgeColor: string;
}> = {
  'A': {
    label: 'Presente',
    icon: Check,
    color: 'bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-900 dark:text-green-100 border-green-200 dark:border-green-700',
    badgeColor: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
  },
  'I': {
    label: 'Ausente',
    icon: X,
    color: 'bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-900 dark:text-red-100 border-red-200 dark:border-red-700',
    badgeColor: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
  },
  'TI': {
    label: 'Tardío',
    icon: Clock,
    color: 'bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900 dark:hover:bg-yellow-800 text-yellow-900 dark:text-yellow-100 border-yellow-200 dark:border-yellow-700',
    badgeColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
  },
  'IJ': {
    label: 'Ausente Just.',
    icon: AlertCircle,
    color: 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-900 dark:text-blue-100 border-blue-200 dark:border-blue-700',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  },
  'TJ': {
    label: 'Tardío Just.',
    icon: Clock,
    color: 'bg-purple-100 hover:bg-purple-200 dark:bg-purple-900 dark:hover:bg-purple-800 text-purple-900 dark:text-purple-100 border-purple-200 dark:border-purple-700',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
  },
};

export default function AttendanceTable({
  sectionId,
  selectedDate,
  onDateChange,
  isHoliday = false,
  holiday,
  data = [],
  loading = false,
  error = null,
}: AttendanceTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());
  const { updateAttendance, bulkApplyStatus } = useAttendanceActions();

  // Filtros de búsqueda
  const filteredStudents = useMemo(() => {
    return data.filter(att => {
      if (!att.enrollment?.student) return false;
      const fullName = `${att.enrollment.student.givenNames} ${att.enrollment.student.lastNames}`.toLowerCase();
      const query = searchQuery.toLowerCase();
      return fullName.includes(query);
    });
  }, [data, searchQuery]);

  // Estadísticas actuales
  const currentStats = useMemo(() => {
    const stats = {
      total: filteredStudents.length,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      pending: 0,
    };

    filteredStudents.forEach(att => {
      if (att.statusCode === 'A') stats.present++;
      else if (att.statusCode === 'I') stats.absent++;
      else if (att.statusCode === 'TI' || att.statusCode === 'TJ') stats.late++;
      else if (att.statusCode === 'IJ') stats.excused++;
      else stats.pending++;
    });

    return stats;
  }, [filteredStudents]);

  const handleStudentSelection = useCallback((enrollmentId: number, selected: boolean) => {
    setSelectedStudents(prev =>
      selected
        ? [...prev, enrollmentId]
        : prev.filter(id => id !== enrollmentId)
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedStudents(filteredStudents
      .filter(s => s.enrollment?.id)
      .map(s => s.enrollment!.id));
  }, [filteredStudents]);

  const handleClearSelection = useCallback(() => {
    setSelectedStudents([]);
  }, []);

  const handleAttendanceChange = useCallback(
    async (enrollmentId: number, statusCode: AttendanceStatusCode) => {
      setUpdatingIds(prev => new Set([...prev, enrollmentId]));
      try {
        await updateAttendance(enrollmentId, { statusCode });
      } catch (err) {
        console.error('Error actualizando asistencia:', err);
      } finally {
        setUpdatingIds(prev => {
          const next = new Set(prev);
          next.delete(enrollmentId);
          return next;
        });
      }
    },
    [updateAttendance]
  );

  const handleBulkAction = useCallback(
    async (enrollmentIds: number[], statusCode: AttendanceStatusCode) => {
      const newUpdatingIds = new Set(enrollmentIds);
      setUpdatingIds(prev => new Set([...prev, ...newUpdatingIds]));
      
      try {
        await bulkApplyStatus({
          enrollmentIds,
          statusCode,
          date: selectedDate.toISOString().split('T')[0],
        });
        setSelectedStudents([]);
      } catch (err) {
        console.error('Error en acción masiva:', err);
      } finally {
        setUpdatingIds(prev => {
          const next = new Set(prev);
          enrollmentIds.forEach(id => next.delete(id));
          return next;
        });
      }
    },
    [bulkApplyStatus, selectedDate]
  );

  // 🎉 Si es día festivo, mostrar componente especial
  if (isHoliday && holiday) {
    return (
      <HolidayNotice
        holiday={holiday}
        selectedDate={selectedDate}
        onDateChange={onDateChange || (() => {})}
      />
    );
  }

  if (isHoliday && !holiday) {
    return (
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <strong>Día Festivo:</strong> No se puede tomar asistencia en días festivos.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // 📭 Estado vacío
  if (data.length === 0 && !loading) {
    return (
      <NoStudentsState
        action={{
          label: "Cambiar sección",
          onClick: () => window.history.back(),
          variant: "default"
        }}
      />
    );
  }

  // 🔍 Sin resultados de búsqueda
  if (searchQuery && filteredStudents.length === 0) {
    return (
      <div className="space-y-4">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar estudiante por nombre o código..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <NoSearchResultsState
          searchQuery={searchQuery}
          onClearSearch={() => setSearchQuery('')}
        />
      </div>
    );
  }

  // ✅ RENDERIZADO NORMAL - Tabla con estudiantes
  return (
    <div className="space-y-4">
      {/* ⚡ Acciones masivas */}
      <BulkActions
        selectedStudents={selectedStudents}
        allStudents={filteredStudents
          .filter(s => s.enrollment?.id)
          .map(s => s.enrollment!.id)}
        totalStudents={currentStats.total}
        onBulkAction={handleBulkAction}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        isProcessing={updatingIds.size > 0}
        currentStats={currentStats}
      />

      {/* 🔍 Barra de búsqueda y estadísticas */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar estudiante por nombre o código..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{currentStats.total}</span>
                <span className="text-gray-500">estudiantes</span>
              </div>

              {currentStats.pending > 0 && (
                <Badge variant="outline" className="bg-gray-50 dark:bg-gray-800">
                  {currentStats.pending} pendientes
                </Badge>
              )}

              {currentStats.present > 0 && (
                <Badge className={ATTENDANCE_CONFIG['A'].badgeColor}>
                  {currentStats.present} presentes
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 📊 Tabla principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Lista de Asistencia</span>
            <Badge variant="secondary">
              {selectedDate.toLocaleDateString('es-GT', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredStudents.map((att, index) => {
              const enrollment = att.enrollment;
              if (!enrollment?.student || !enrollment?.id) return null;

              return (
                <div
                  key={att.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(enrollment.id)}
                      onChange={(e) => handleStudentSelection(enrollment.id, e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                    />

                    <AttendanceStudentAvatar
                      student={enrollment.student}
                      onClick={() => console.log('Ver perfil del estudiante')}
                    />

                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {enrollment.student.givenNames} {enrollment.student.lastNames}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                        <span>#{index + 1}</span>
                      </div>
                    </div>

                    {att.statusCode && (
                      <Badge className={ATTENDANCE_CONFIG[att.statusCode].badgeColor}>
                        {ATTENDANCE_CONFIG[att.statusCode].label}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {(Object.entries(ATTENDANCE_CONFIG) as [AttendanceStatusCode, typeof ATTENDANCE_CONFIG[AttendanceStatusCode]][]).map(([statusCode, config]) => {
                      const Icon = config.icon;
                      const isActive = att.statusCode === statusCode;
                      const isUpdating = updatingIds.has(enrollment.id);

                      return (
                        <Button
                          key={statusCode}
                          variant={isActive ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleAttendanceChange(enrollment.id, statusCode)}
                          disabled={isUpdating}
                          className={isActive ? config.color : "hover:bg-gray-100 dark:hover:bg-gray-800"}
                          title={config.label}
                        >
                          {isUpdating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Icon className="h-4 w-4" />
                          )}
                          <span className="ml-1 hidden md:inline">{config.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 📊 Resumen final */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{currentStats.total}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{currentStats.present}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Presentes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{currentStats.absent}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Ausentes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{currentStats.late}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Tardíos</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{currentStats.excused}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Justificados</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
