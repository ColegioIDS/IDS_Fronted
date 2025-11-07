'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Check, X, Clock, AlertCircle, Search, Users, Loader2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';

import { StudentAttendanceWithRelations, AttendanceStatusCode } from '@/types/attendance.types';
import { useAttendanceActions } from '@/hooks/attendance';

import HolidayNotice from '../attendance-states/HolidayNotice';
import BulkActions from '../attendance-controls/BulkActions';
import { MediumStudentAvatar } from './StudentAvatar';
import { NoStudentsState, NoSearchResultsState } from '../attendance-states/EmptyState';

interface AttendanceCardsProps {
  sectionId?: number;
  selectedDate: Date;
  isHoliday?: boolean;
  holiday?: {
    id: number;
    date: Date | string;
    description: string;
    isRecovered: boolean;
  };
  onDateChange?: (date: Date) => void;
  data?: StudentAttendanceWithRelations[];
  loading?: boolean;
  error?: string | null;
}

const ATTENDANCE_CONFIG: Record<AttendanceStatusCode, {
  label: string;
  fullLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  inactiveColor: string;
  badgeColor: string;
}> = {
  'A': {
    label: 'P',
    fullLabel: 'Presente',
    icon: Check,
    color: 'bg-green-500 hover:bg-green-600 text-white border-green-500 dark:bg-green-600 dark:hover:bg-green-700',
    inactiveColor: 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/30 dark:text-green-300 dark:border-green-800',
    badgeColor: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
  },
  'I': {
    label: 'A',
    fullLabel: 'Ausente',
    icon: X,
    color: 'bg-red-500 hover:bg-red-600 text-white border-red-500 dark:bg-red-600 dark:hover:bg-red-700',
    inactiveColor: 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-300 dark:border-red-800',
    badgeColor: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
  },
  'TI': {
    label: 'T',
    fullLabel: 'Tardío',
    icon: Clock,
    color: 'bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500 dark:bg-yellow-600 dark:hover:bg-yellow-700',
    inactiveColor: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
    badgeColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
  },
  'IJ': {
    label: 'AJ',
    fullLabel: 'Ausente Just.',
    icon: AlertCircle,
    color: 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700',
    inactiveColor: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
  },
  'TJ': {
    label: 'TJ',
    fullLabel: 'Tardío Just.',
    icon: Clock,
    color: 'bg-purple-500 hover:bg-purple-600 text-white border-purple-500 dark:bg-purple-600 dark:hover:bg-purple-700',
    inactiveColor: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200'
  }
};

export default function AttendanceCards({
  sectionId,
  selectedDate,
  isHoliday = false,
  holiday,
  onDateChange,
  data = [],
  loading = false,
  error = null,
}: AttendanceCardsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());
  const { updateAttendance, bulkApplyStatus } = useAttendanceActions();

  // Filtros de búsqueda
  const filteredStudents = useMemo(() => {
    return data.filter(att => {
      const fullName = `${att.enrollment?.student.givenNames} ${att.enrollment?.student.lastNames}`.toLowerCase();
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

  const toggleCardExpanded = useCallback((enrollmentId: number) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      if (next.has(enrollmentId)) {
        next.delete(enrollmentId);
      } else {
        next.add(enrollmentId);
      }
      return next;
    });
  }, []);

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
                placeholder="Buscar estudiante por nombre..."
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

  // ✅ RENDERIZADO NORMAL - Tarjetas con estudiantes
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

      {/* 🔍 Barra de búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar estudiante por nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* 📊 Grid de tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map((att) => {
          const enrollment = att.enrollment;
          if (!enrollment?.student || !enrollment?.id) return null;
          
          const isExpanded = expandedCards.has(enrollment.id);
          const isUpdating = updatingIds.has(enrollment.id);

          return (
            <Card
              key={att.id}
              className="hover:shadow-md transition-shadow dark:bg-gray-800"
            >
              <CardContent className="p-4 space-y-3">
                {/* Encabezado de la tarjeta */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <Checkbox
                      checked={selectedStudents.includes(enrollment.id)}
                      onCheckedChange={(checked) =>
                        handleStudentSelection(enrollment.id, checked as boolean)
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {enrollment.student.givenNames} {enrollment.student.lastNames}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {att.statusCode && (
                          <Badge className={ATTENDANCE_CONFIG[att.statusCode].badgeColor}>
                            {ATTENDANCE_CONFIG[att.statusCode].fullLabel}
                          </Badge>
                        )}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleCardExpanded(enrollment.id)}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </Button>
                </div>

                {/* Contenido expandible */}
                {isExpanded && (
                  <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 gap-2">
                      {(Object.entries(ATTENDANCE_CONFIG) as [AttendanceStatusCode, typeof ATTENDANCE_CONFIG[AttendanceStatusCode]][]).map(([statusCode, config]) => {
                        const Icon = config.icon;
                        const isActive = att.statusCode === statusCode;

                        return (
                          <Button
                            key={statusCode}
                            variant={isActive ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleAttendanceChange(enrollment.id, statusCode)}
                            disabled={isUpdating}
                            className={isActive ? config.color : config.inactiveColor}
                            title={config.fullLabel}
                          >
                            {isUpdating ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Icon className="h-3 w-3" />
                            )}
                            <span className="ml-1 text-xs">{config.label}</span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

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
