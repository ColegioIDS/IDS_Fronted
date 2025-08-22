// src/components/attendance/components/attendance-grid/AttendanceCards.tsx - ACTUALIZADO
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Check, X, Clock, FileText, Search, Users, Loader2, AlertCircle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { useEnrollmentContext } from '@/context/EnrollmentContext';
import { useAttendanceContext } from '@/context/AttendanceContext';
import { useCurrentBimester } from '@/context/newBimesterContext';
import { AttendanceStatus } from '@/types/attendance.types';
import HolidayNotice from '../attendance-states/HolidayNotice';
import BulkActions from '../attendance-controls/BulkActions';
import { MediumStudentAvatar } from './StudentAvatar';

// 🎯 NUEVAS IMPORTACIONES - Estados profesionales
import { LoadingCards } from '../attendance-states/LoadingState';
import { 
  ServerError, 
  NetworkError, 
  LoadFailedError 
} from '../attendance-states/ErrorState';
import { 
  NoStudentsState, 
  NoSearchResultsState 
} from '../attendance-states/EmptyState';

interface AttendanceCardsProps {
  sectionId: number;
  selectedDate: Date;
  isHoliday?: boolean;
  holiday?: {
    id: number;
    date: Date | string;
    description: string;
    isRecovered: boolean;
  };
  onDateChange: (date: Date) => void;
}

// 🎨 Configuración de estados de asistencia
const ATTENDANCE_CONFIG = {
  present: {
    label: 'P',
    fullLabel: 'Presente',
    icon: Check,
    color: 'bg-green-500 hover:bg-green-600 text-white border-green-500 dark:bg-green-600 dark:hover:bg-green-700',
    inactiveColor: 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/30 dark:text-green-300 dark:border-green-800',
    badgeColor: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
  },
  absent: {
    label: 'A',
    fullLabel: 'Ausente',
    icon: X,
    color: 'bg-red-500 hover:bg-red-600 text-white border-red-500 dark:bg-red-600 dark:hover:bg-red-700',
    inactiveColor: 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-300 dark:border-red-800',
    badgeColor: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
  },
  late: {
    label: 'T',
    fullLabel: 'Tardío',
    icon: Clock,
    color: 'bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500 dark:bg-yellow-600 dark:hover:bg-yellow-700',
    inactiveColor: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
    badgeColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
  },
  excused: {
    label: 'J',
    fullLabel: 'Justificado',
    icon: FileText,
    color: 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700',
    inactiveColor: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
  }
};

export default function AttendanceCards({ 
  sectionId, 
  selectedDate, 
  isHoliday = false,
  holiday,
  onDateChange
}: AttendanceCardsProps) {
  // 🎯 Estados locales
  const [searchQuery, setSearchQuery] = useState('');
  const [attendanceStates, setAttendanceStates] = useState<Record<number, AttendanceStatus>>({});
  const [savingStates, setSavingStates] = useState<Record<number, boolean>>({});
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  // 📄 Contextos
  const { fetchEnrollmentsBySection, state: enrollmentState } = useEnrollmentContext();
  const { 
    createAttendance, 
    updateAttendance,
    fetchAttendancesByBimester,
    state: attendanceState 
  } = useAttendanceContext();
  const { bimester: activeBimester } = useCurrentBimester();

  // 🧹 Limpiar estados cuando cambia la fecha
  useEffect(() => {
    setAttendanceStates({});
    setSelectedStudents([]);
    setExpandedCards(new Set());
  }, [selectedDate]);

  // 📚 Cargar estudiantes de la sección
  useEffect(() => {
    if (sectionId) {
      fetchEnrollmentsBySection(sectionId);
    }
  }, [sectionId, fetchEnrollmentsBySection]);

  // 📊 Cargar asistencias existentes del día
  useEffect(() => {
    if (activeBimester?.id && sectionId) {
      fetchAttendancesByBimester(activeBimester.id);
    }
  }, [activeBimester?.id, sectionId, selectedDate, fetchAttendancesByBimester]);

  // 🔍 Filtrar estudiantes por búsqueda
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) {
      return enrollmentState.enrollments;
    }
    console.log("Enrollment", enrollmentState.enrollments);

    return enrollmentState.enrollments.filter(enrollment => {
      const fullName = `${enrollment.student.givenNames} ${enrollment.student.lastNames}`.toLowerCase();
      const code = enrollment.student.codeSIRE?.toLowerCase() || '';
      const query = searchQuery.toLowerCase();
      
      return fullName.includes(query) || code.includes(query);
    });
  }, [enrollmentState.enrollments, searchQuery]);

  // 📊 Inicializar estados de asistencia con datos existentes
  useEffect(() => {
    const attendances = Array.isArray(attendanceState.attendances) ? attendanceState.attendances : [];
    
    if (attendances.length > 0 && filteredStudents.length > 0) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const existingAttendances: Record<number, AttendanceStatus> = {};

      filteredStudents.forEach(enrollment => {
        const existingAttendance = attendances.find(att => 
          att.enrollmentId === enrollment.id && 
          new Date(att.date).toISOString().split('T')[0] === dateStr
        );

        if (existingAttendance) {
          existingAttendances[enrollment.id] = existingAttendance.status;
        }
      });

      setAttendanceStates(prev => ({ ...prev, ...existingAttendances }));
    }
  }, [attendanceState.attendances, filteredStudents, selectedDate]);

  // 🎯 Manejar cambio de estado de asistencia
  const handleAttendanceChange = async (enrollmentId: number, status: AttendanceStatus) => {
    if (!activeBimester?.id || isHoliday) return;

    // 📄 Actualizar estado local inmediatamente (optimistic update)
    setAttendanceStates(prev => ({ ...prev, [enrollmentId]: status }));
    setSavingStates(prev => ({ ...prev, [enrollmentId]: true }));

    try {
      // 📅 Verificar si ya existe asistencia para este día
      const dateStr = selectedDate.toISOString().split('T')[0];
      const attendances = Array.isArray(attendanceState.attendances) ? attendanceState.attendances : [];
      
      const existingAttendance = attendances.find(att => 
        att.enrollmentId === enrollmentId && 
        new Date(att.date).toISOString().split('T')[0] === dateStr
      );

      if (existingAttendance) {
        await updateAttendance(existingAttendance.id, {
          status,
          date: selectedDate
        });
      } else {
        await createAttendance({
          enrollmentId,
          bimesterId: activeBimester.id,
          date: selectedDate,
          status
        });
      }
    } catch (error) {
      // ❌ Error - revertir estado optimistic
      setAttendanceStates(prev => {
        const newState = { ...prev };
        delete newState[enrollmentId];
        return newState;
      });
      console.error('Error al guardar asistencia:', error);
    } finally {
      setSavingStates(prev => ({ ...prev, [enrollmentId]: false }));
    }
  };

  // 📊 Calcular estadísticas actuales
  const currentStats = useMemo(() => {
    const total = filteredStudents.length;
    const present = Object.values(attendanceStates).filter(s => s === 'present').length;
    const absent = Object.values(attendanceStates).filter(s => s === 'absent').length;
    const late = Object.values(attendanceStates).filter(s => s === 'late').length;
    const excused = Object.values(attendanceStates).filter(s => s === 'excused').length;
    const pending = total - (present + absent + late + excused);

    return { total, present, absent, late, excused, pending };
  }, [filteredStudents, attendanceStates]);

  // 🎯 Manejar selección de estudiantes
  const handleStudentSelection = (enrollmentId: number, isSelected: boolean) => {
    if (isSelected) {
      setSelectedStudents(prev => [...prev, enrollmentId]);
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== enrollmentId));
    }
  };

  const handleSelectAll = () => {
    const allIds = filteredStudents.map(s => s.id);
    setSelectedStudents(allIds);
  };

  const handleClearSelection = () => {
    setSelectedStudents([]);
  };

  // ⚡ Manejar acciones masivas
  const handleBulkAction = async (enrollmentIds: number[], status: AttendanceStatus) => {
    if (!activeBimester?.id || isHoliday) return;

    // Aplicar optimistic updates
    const newStates = { ...attendanceStates };
    enrollmentIds.forEach(id => {
      newStates[id] = status;
    });
    setAttendanceStates(newStates);

    // Marcar como guardando
    const savingState = { ...savingStates };
    enrollmentIds.forEach(id => {
      savingState[id] = true;
    });
    setSavingStates(savingState);

    try {
      // Procesar cada estudiante
      for (const enrollmentId of enrollmentIds) {
        await handleAttendanceChange(enrollmentId, status);
      }
      
      // Limpiar selección después del éxito
      setSelectedStudents([]);
    } catch (error) {
      // Revertir en caso de error
      enrollmentIds.forEach(id => {
        delete newStates[id];
      });
      setAttendanceStates(newStates);
      console.error('Error en acción masiva:', error);
    } finally {
      // Limpiar estados de guardado
      const cleanSavingState = { ...savingStates };
      enrollmentIds.forEach(id => {
        delete cleanSavingState[id];
      });
      setSavingStates(cleanSavingState);
    }
  };

  // 🔄 Función para recargar datos
  const handleRetry = () => {
    if (sectionId) {
      fetchEnrollmentsBySection(sectionId);
    }
  };

  // 🎉 Si es día festivo, mostrar componente especial
  if (isHoliday && holiday) {
    return (
      <HolidayNotice
        holiday={holiday}
        selectedDate={selectedDate}
        onDateChange={onDateChange}
      />
    );
  }

  console.log("Estado de matrícula:", enrollmentState);
  console.log("Matrículas:", enrollmentState.enrollments);

  // 🎉 Si es día festivo pero no tenemos la información completa
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

  // ⏳ NUEVO: Estado de carga profesional para cards
  if (enrollmentState.loading) {
    return (
      <LoadingCards 
        title="Cargando estudiantes..."
        description="Preparando la vista de cards para los estudiantes matriculados"
        skeletonItems={6}
      />
    );
  }

  // ❌ NUEVO: Estado de error profesional con opciones de recuperación
  if (enrollmentState.error) {
    // Determinar tipo de error
    const errorMessage = enrollmentState.error.toLowerCase();
    
    if (errorMessage.includes('network') || errorMessage.includes('connection')) {
      return (
        <NetworkError 
          error={enrollmentState.error}
          onRetry={handleRetry}
          onReset={() => window.location.reload()}
          title="Error de conexión en vista cards"
          description="No se pueden cargar los estudiantes debido a problemas de conectividad."
        />
      );
    }
    
    if (errorMessage.includes('server') || errorMessage.includes('500')) {
      return (
        <ServerError 
          error={enrollmentState.error}
          onRetry={handleRetry}
          onContact={() => alert('Contacta al administrador del sistema')}
          title="Error del servidor en vista cards"
        />
      );
    }
    
    // Error genérico de carga
    return (
      <LoadFailedError 
        error={enrollmentState.error}
        onRetry={handleRetry}
        onReset={() => window.location.reload()}
        title="Error al cargar vista de cards"
        description="No se pudieron cargar los datos para la vista de cards. Inténtalo de nuevo."
      />
    );
  }

  // 📭 NUEVO: Estado vacío profesional para cards
  if (enrollmentState.enrollments.length === 0) {
    return (
      <NoStudentsState 
        title="No hay estudiantes para mostrar en cards"
        description="Esta sección no tiene estudiantes matriculados para mostrar en la vista de cards."
        action={{
          label: "Recargar estudiantes",
          onClick: handleRetry,
          variant: "default"
        }}
        secondaryAction={{
          label: "Cambiar a vista tabla",
          onClick: () => alert('Puedes cambiar a vista tabla usando el toggle superior'),
          variant: "outline"
        }}
      />
    );
  }

  // 🔍 NUEVO: Sin resultados de búsqueda en cards
  if (searchQuery && filteredStudents.length === 0) {
    return (
      <div className="space-y-4">
        {/* Mantener barra de búsqueda */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
              <Input
                placeholder="Buscar estudiante por nombre o código..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              />
            </div>
          </CardContent>
        </Card>

        {/* Estado sin resultados para cards */}
        <NoSearchResultsState 
          searchQuery={searchQuery}
          onClearSearch={() => setSearchQuery('')}
          title="Sin estudiantes en vista cards"
          description="No se encontraron estudiantes que coincidan con tu búsqueda en la vista de cards."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ⚡ Acciones masivas - Collapsed en móvil */}
      <BulkActions
        selectedStudents={selectedStudents}
        allStudents={filteredStudents.map(s => s.id)}
        totalStudents={currentStats.total}
        onBulkAction={handleBulkAction}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        isProcessing={Object.values(savingStates).some(Boolean)}
        currentStats={currentStats}
      />

      {/* 🔍 Barra de búsqueda */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
            <Input
              placeholder="Buscar estudiante por nombre o código..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          {/* 📊 Stats rápidas */}
          <div className="flex justify-between items-center mt-3 text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {currentStats.total} estudiantes
            </span>
            <div className="flex space-x-2">
              {currentStats.pending > 0 && (
                <Badge variant="outline" className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  {currentStats.pending} pendientes
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 📱 Grid de cards de estudiantes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredStudents.map((enrollment, index) => {
          const isSelected = selectedStudents.includes(enrollment.id);
          const currentStatus = attendanceStates[enrollment.id];
          const isSaving = savingStates[enrollment.id];
          
          return (
            <Card 
              key={enrollment.id}
              className={`
                relative transition-all duration-200 hover:shadow-md
                ${isSelected 
                  ? 'ring-2 ring-blue-500 dark:ring-blue-400 bg-blue-50 dark:bg-blue-900/10 border-blue-300 dark:border-blue-700' 
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }
                ${isSaving ? 'opacity-75' : ''}
              `}
            >
              <CardContent className="p-4">
                {/* 🎯 Header del card */}
                <div className="flex items-start space-x-3 mb-3">
                  {/* ☑️ Checkbox de selección */}
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => 
                      handleStudentSelection(enrollment.id, checked as boolean)
                    }
                    className="mt-1 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 dark:data-[state=checked]:bg-blue-500"
                  />

                  {/* 📷 Avatar */}
                  <MediumStudentAvatar 
  student={enrollment.student}
  showUploadButton={false}
  onClick={() => console.log('Ver perfil del estudiante')}
/>

                  {/* 📄 Info del estudiante */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm leading-tight">
                      {enrollment.student.givenNames.split(' ')[0]} {enrollment.student.lastNames.split(' ')[0]}
                    </h3>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      #{index + 1}
                      {enrollment.student.codeSIRE && (
                        <span className="ml-2">• {enrollment.student.codeSIRE}</span>
                      )}
                    </div>
                    
                    {/* 🏷️ Estado actual */}
                    {currentStatus && (
                      <Badge 
                        className={`mt-2 text-xs ${ATTENDANCE_CONFIG[currentStatus].badgeColor}`}
                      >
                        {ATTENDANCE_CONFIG[currentStatus].fullLabel}
                      </Badge>
                    )}
                  </div>

                  {/* ⏳ Indicador de guardado */}
                  {isSaving && (
                    <div className="absolute top-2 right-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
                    </div>
                  )}
                </div>

                {/* 🎮 Botones de estado */}
                <div className="grid grid-cols-4 gap-1">
                  {(Object.entries(ATTENDANCE_CONFIG) as [AttendanceStatus, typeof ATTENDANCE_CONFIG[AttendanceStatus]][]).map(([status, config]) => {
                    const Icon = config.icon;
                    const isActive = currentStatus === status;
                    const isDisabled = isSaving || isHoliday;

                    return (
                      <Button
                        key={status}
                        variant="outline"
                        size="sm"
                        onClick={() => handleAttendanceChange(enrollment.id, status)}
                        disabled={isDisabled}
                        className={`
                          h-10 p-0 flex flex-col items-center justify-center text-xs font-medium transition-all
                          ${isActive ? config.color : config.inactiveColor}
                          ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                        title={config.fullLabel}
                      >
                        <Icon className="h-3 w-3 mb-0.5" />
                        <span>{config.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 📊 Resumen final */}
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-gray-200 dark:border-gray-600">
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">{currentStats.total}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">{currentStats.present}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Presentes</div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold text-red-600 dark:text-red-400">{currentStats.absent}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Ausentes</div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold text-yellow-600 dark:text-yellow-400">{currentStats.late}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Tardíos</div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">{currentStats.excused}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Justificados</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}