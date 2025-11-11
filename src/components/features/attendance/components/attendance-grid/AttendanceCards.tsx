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
import { useAttendanceActions, useAttendanceStatuses } from '@/hooks/attendance';

import HolidayNotice from '../attendance-states/HolidayNotice';
import BulkActions from '../attendance-controls/BulkActions';
import { CourseSelector } from '../attendance-controls/CourseSelector'; // ✅ NUEVO
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
  onRefresh?: () => void | Promise<void>;
  data?: any[];  // Backend devuelve datos con studentName, enrollmentId, statusCode, etc
  loading?: boolean;
  error?: string | null;
}

const ATTENDANCE_CONFIG_FALLBACK: Record<AttendanceStatusCode, {
  label: string;
  fullLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  inactiveColor: string;
  badgeColor: string;
}> = {
  'P': {
    label: 'P',
    fullLabel: 'Presente',
    icon: Check,
    color: 'bg-green-500 hover:bg-green-600 text-white border-green-500 dark:bg-green-600 dark:hover:bg-green-700',
    inactiveColor: 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/30 dark:text-green-300 dark:border-green-800',
    badgeColor: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
  },
  'I': {
    label: 'I',
    fullLabel: 'Inasistencia',
    icon: X,
    color: 'bg-red-500 hover:bg-red-600 text-white border-red-500 dark:bg-red-600 dark:hover:bg-red-700',
    inactiveColor: 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-300 dark:border-red-800',
    badgeColor: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
  },
  'T': {
    label: 'T',
    fullLabel: 'Tardanza',
    icon: Clock,
    color: 'bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500 dark:bg-yellow-600 dark:hover:bg-yellow-700',
    inactiveColor: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
    badgeColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
  },
  'IJ': {
    label: 'IJ',
    fullLabel: 'Inasistencia Justificada',
    icon: AlertCircle,
    color: 'bg-orange-500 hover:bg-orange-600 text-white border-orange-500 dark:bg-orange-600 dark:hover:bg-orange-700',
    inactiveColor: 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
    badgeColor: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200'
  },
  'TJ': {
    label: 'TJ',
    fullLabel: 'Tardanza Justificada',
    icon: Clock,
    color: 'bg-lime-500 hover:bg-lime-600 text-white border-lime-500 dark:bg-lime-600 dark:hover:bg-lime-700',
    inactiveColor: 'bg-lime-50 hover:bg-lime-100 text-lime-700 border-lime-200 dark:bg-lime-900/20 dark:hover:bg-lime-900/30 dark:text-lime-300 dark:border-lime-800',
    badgeColor: 'bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-200'
  },
  'E': {
    label: 'E',
    fullLabel: 'Excusado',
    icon: AlertCircle,
    color: 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700',
    inactiveColor: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
  },
  'M': {
    label: 'M',
    fullLabel: 'Permiso Médico',
    icon: AlertCircle,
    color: 'bg-violet-500 hover:bg-violet-600 text-white border-violet-500 dark:bg-violet-600 dark:hover:bg-violet-700',
    inactiveColor: 'bg-violet-50 hover:bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:hover:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800',
    badgeColor: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-200'
  },
  'A': {
    label: 'A',
    fullLabel: 'Permiso Administrativo',
    icon: AlertCircle,
    color: 'bg-cyan-500 hover:bg-cyan-600 text-white border-cyan-500 dark:bg-cyan-600 dark:hover:bg-cyan-700',
    inactiveColor: 'bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:hover:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800',
    badgeColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-200'
  }
};

export default function AttendanceCards({
  sectionId,
  selectedDate,
  isHoliday = false,
  holiday,
  onDateChange,
  onRefresh,
  data = [],
  loading = false,
  error = null,
}: AttendanceCardsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]); // ✅ NUEVO
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());
  const { upsertAttendance, bulkApplyStatus } = useAttendanceActions();
  
  // 📡 Cargar estados dinámicamente desde el backend
  const { statuses, loading: statusesLoading } = useAttendanceStatuses();
  
  // 🎨 Generar configuración dinámica de asistencia desde los estados cargados
  const ATTENDANCE_CONFIG = useMemo<Record<number, {
    code: AttendanceStatusCode;
    label: string;
    fullLabel: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    inactiveColor: string;
    badgeColor: string;
  }>>(() => {
    const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
      'P': Check,
      'I': X,
      'T': Clock,
      'IJ': AlertCircle,
      'TJ': Clock,
      'E': AlertCircle,
      'M': AlertCircle,
      'A': AlertCircle,
    };
    
    // Mapeo de colores hex a clases Tailwind (mismo que en AttendanceTable)
    const hexToTailwind: Record<string, { bg: string; hover: string; text: string; badge: string }> = {
      '#10b981': { // Verde (P - Presente)
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        hover: 'hover:bg-emerald-200 dark:hover:bg-emerald-800',
        text: 'text-emerald-900 dark:text-emerald-100',
        badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200'
      },
      '#ef4444': { // Rojo (I - Inasistencia)
        bg: 'bg-red-100 dark:bg-red-900/30',
        hover: 'hover:bg-red-200 dark:hover:bg-red-800',
        text: 'text-red-900 dark:text-red-100',
        badge: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
      },
      '#eab308': { // Amarillo (T - Tardanza)
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        hover: 'hover:bg-yellow-200 dark:hover:bg-yellow-800',
        text: 'text-yellow-900 dark:text-yellow-100',
        badge: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
      },
      '#f59e0b': { // Ámbar (IJ - Inasistencia Justificada)
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        hover: 'hover:bg-amber-200 dark:hover:bg-amber-800',
        text: 'text-amber-900 dark:text-amber-100',
        badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200'
      },
      '#84cc16': { // Lima (TJ - Tardanza Justificada)
        bg: 'bg-lime-100 dark:bg-lime-900/30',
        hover: 'hover:bg-lime-200 dark:hover:bg-lime-800',
        text: 'text-lime-900 dark:text-lime-100',
        badge: 'bg-lime-100 dark:bg-lime-900/30 text-lime-800 dark:text-lime-200'
      },
      '#3b82f6': { // Azul (E - Excusado)
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        hover: 'hover:bg-blue-200 dark:hover:bg-blue-800',
        text: 'text-blue-900 dark:text-blue-100',
        badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
      },
      '#8b5cf6': { // Violeta (M - Permiso Médico)
        bg: 'bg-violet-100 dark:bg-violet-900/30',
        hover: 'hover:bg-violet-200 dark:hover:bg-violet-800',
        text: 'text-violet-900 dark:text-violet-100',
        badge: 'bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-200'
      },
      '#6366f1': { // Indigo (A - Permiso Administrativo)
        bg: 'bg-indigo-100 dark:bg-indigo-900/30',
        hover: 'hover:bg-indigo-200 dark:hover:bg-indigo-800',
        text: 'text-indigo-900 dark:text-indigo-100',
        badge: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200'
      },
    };

    const config: Record<string, any> = {};
    
    // Si los estados están cargados, usar sus nombres y colores del backend
    if (statuses.length > 0) {
      statuses.forEach(status => {
        const colorHex = status.colorCode || '#6b7280';
        const tailwindColors = hexToTailwind[colorHex] || {
          bg: 'bg-gray-100 dark:bg-gray-900/30',
          hover: 'hover:bg-gray-200 dark:hover:bg-gray-800',
          text: 'text-gray-900 dark:text-gray-100',
          badge: 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200'
        };
        
        config[status.id] = {
          code: status.code as AttendanceStatusCode,
          label: status.name,
          fullLabel: status.name,
          icon: iconMap[status.code] || Check,
          color: `${tailwindColors.bg} ${tailwindColors.hover} ${tailwindColors.text} border-2 border-gray-200 dark:border-gray-700`,
          inactiveColor: `border-2 border-gray-300 dark:border-gray-600 ${tailwindColors.text}`,
          badgeColor: tailwindColors.badge,
        };
      });
    } else {
      // Fallback si no hay estados cargados
      config['P'] = { 
        label: 'Presente', 
        fullLabel: 'Presente',
        icon: Check,
        color: 'bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900 dark:hover:bg-emerald-800 text-emerald-900 dark:text-emerald-100 border-2 border-gray-200 dark:border-gray-700',
        inactiveColor: 'border-2 border-gray-300 dark:border-gray-600 text-emerald-900 dark:text-emerald-100',
        badgeColor: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200'
      };
    }
    
    return config;
  }, [statuses]);

  // Filtros de búsqueda
  const filteredStudents = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.filter(att => {
      // Validar que studentName existe
      if (!att || !att.studentName) return false;
      
      const fullName = att.studentName.toLowerCase();
      const query = searchQuery.toLowerCase();
      return fullName.includes(query);
    });
  }, [data, searchQuery]);

  // Estadísticas actuales
  // Estadísticas actuales - DINÁMICAS POR CÓDIGO DE ESTADO
  const currentStats = useMemo(() => {
    // Crear contador dinámico para cada código de estado
    const stats: Record<string, number> = {
      total: filteredStudents.length,
    };

    // Inicializar contador para cada estado activo del backend
    if (statuses.length > 0) {
      statuses.forEach(status => {
        stats[status.code] = 0;
      });
    } else {
      // Fallback si los estados no cargaron
      stats['P'] = 0;
      stats['I'] = 0;
      stats['IJ'] = 0;
      stats['T'] = 0;
      stats['TJ'] = 0;
      stats['E'] = 0;
      stats['M'] = 0;
      stats['A'] = 0;
    }

    console.log('[AttendanceCards Stats Debug]', {
      filteredStudentsLength: filteredStudents.length,
      statusesLength: statuses.length,
      statusesCodes: statuses.map(s => s.code),
    });

    // Crear mapeo de ID → código para contar
    const statusCodeMap = new Map(statuses.map(s => [s.id, s.code]));

    // Contar por código de estado (usando attendanceStatusId)
    filteredStudents.forEach(att => {
      if (!att.attendanceStatusId) {
        return;
      }

      // Obtener el código asociado al ID
      const code = statusCodeMap.get(att.attendanceStatusId);
      if (code && stats.hasOwnProperty(code)) {
        stats[code]++;
      }
    });

    console.log('[AttendanceCards Stats Result]', stats);
    return stats;
  }, [filteredStudents, statuses]);

  const handleStudentSelection = useCallback((enrollmentId: number, selected: boolean) => {
    setSelectedStudents(prev =>
      selected
        ? [...prev, enrollmentId]
        : prev.filter(id => id !== enrollmentId)
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedStudents(filteredStudents
      .filter(s => s.enrollmentId)
      .map(s => s.enrollmentId));
  }, [filteredStudents]);

  const handleClearSelection = useCallback(() => {
    setSelectedStudents([]);
  }, []);

  const handleAttendanceChange = useCallback(
    async (enrollmentId: number, attendanceStatusId: number) => {
      setUpdatingIds(prev => new Set([...prev, enrollmentId]));
      try {
        const isoDate = selectedDate.toISOString().split('T')[0];
        await upsertAttendance({
          enrollmentId,
          date: isoDate,
          attendanceStatusId,
          ...(selectedCourseIds.length > 0 && { courseAssignmentIds: selectedCourseIds }), // ✅ NUEVO: Agregar cursos seleccionados
        }, true);
        if (onRefresh) await onRefresh();
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
    [upsertAttendance, selectedDate, onRefresh, selectedCourseIds] // ✅ NUEVO: Agregar selectedCourseIds a las dependencias
  );

  const handleBulkAction = useCallback(
    async (enrollmentIds: number[], attendanceStatusId: number) => {
      const newUpdatingIds = new Set(enrollmentIds);
      setUpdatingIds(prev => new Set([...prev, ...newUpdatingIds]));
      
      try {
        await bulkApplyStatus({
          enrollmentIds,
          attendanceStatusId,
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
      {/* ✅ NUEVO: Selector de cursos */}
      <CourseSelector
        sectionId={sectionId}
        selectedCourseIds={selectedCourseIds}
        onSelectionChange={setSelectedCourseIds}
        disabled={false}
      />

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
          if (!att || !att.enrollmentId) return null;
          
          const enrollmentId = att.enrollmentId;
          const studentName = att.studentName || 'Estudiante';
          const isExpanded = expandedCards.has(enrollmentId);
          const isUpdating = updatingIds.has(enrollmentId);

          const statusConfig = att.attendanceStatusId ? ATTENDANCE_CONFIG[att.attendanceStatusId] : null;
          const cardBgColor = statusConfig ? statusConfig.color.split(' ').filter((c: string) => c.includes('bg-')).join(' ') : '';
          const cardTextColor = statusConfig ? statusConfig.color.split(' ').filter((c: string) => c.includes('text-')).join(' ') : '';
          const cardClasses = att.attendanceStatusId ? `${cardBgColor} ${cardTextColor}` : 'dark:bg-gray-800';

          return (
            <Card
              key={att.id || enrollmentId}
              className={`hover:shadow-md transition-shadow ${cardClasses}`}
            >
              <CardContent className="p-4 space-y-3">
                {/* Encabezado de la tarjeta */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <Checkbox
                      checked={selectedStudents.includes(enrollmentId)}
                      onCheckedChange={(checked) =>
                        handleStudentSelection(enrollmentId, checked as boolean)
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {studentName}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {att.attendanceStatusId && ATTENDANCE_CONFIG[att.attendanceStatusId] && (
                          <Badge className={ATTENDANCE_CONFIG[att.attendanceStatusId]?.badgeColor}>
                            {ATTENDANCE_CONFIG[att.attendanceStatusId]?.fullLabel}
                          </Badge>
                        )}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleCardExpanded(enrollmentId)}
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
                      {statuses.map((status) => {
                        const config = ATTENDANCE_CONFIG[status.id];
                        const Icon = config?.icon;
                        const isActive = att.attendanceStatusId === status.id;

                        return (
                          <Button
                            key={status.id}
                            variant={isActive ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleAttendanceChange(enrollmentId, status.id)}
                            disabled={isUpdating}
                            className={isActive ? config?.color : config?.inactiveColor}
                            title={config?.fullLabel}
                          >
                            {isUpdating ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              Icon && <Icon className="h-3 w-3" />
                            )}
                            <span className="ml-1 text-xs">{config?.label}</span>
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

      {/* 📊 Resumen final dinámico */}
      <Card>
        <CardContent className="pt-6">
          <div className={`grid grid-cols-2 md:grid-cols-${Math.max(2, (statuses?.length || 0) + 1)} gap-4 text-center`}>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{currentStats.total}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total</div>
            </div>
            {statuses && statuses.map((status) => {
              const config = ATTENDANCE_CONFIG[status.id];
              return (
                <div key={status.id}>
                  <div className={`text-2xl font-bold ${config?.color?.split(' ').find((c: string) => c.startsWith('text-')) || 'text-gray-900 dark:text-gray-100'}`}>{currentStats[status.code] || 0}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{status.name}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
