// src/components/attendance/components/attendance-grid/AttendanceTable.tsx - ACTUALIZADO
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Check, X, Clock, FileText, Search, Users, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEnrollmentContext } from '@/context/EnrollmentContext';
import { useAttendanceContext } from '@/context/AttendanceContext';
import { useCurrentBimester } from '@/context/newBimesterContext';
import { AttendanceStatus } from '@/types/attendance.types';
import HolidayNotice from '../attendance-states/HolidayNotice';
import BulkActions from '../attendance-controls/BulkActions';
import { AttendanceStudentAvatar } from './StudentAvatar';

// 🎯 NUEVAS IMPORTACIONES - Estados profesionales
import { LoadingTable } from '../attendance-states/LoadingState';
import { 
  ServerError, 
  NetworkError, 
  LoadFailedError 
} from '../attendance-states/ErrorState';
import { 
  NoStudentsState, 
  NoSearchResultsState 
} from '../attendance-states/EmptyState';

interface AttendanceTableProps {
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
    label: 'Presente',
    icon: Check,
    color: 'bg-green-100 hover:bg-green-200 text-green-800 border-green-300 dark:bg-green-900/20 dark:hover:bg-green-900/30 dark:text-green-200 dark:border-green-800',
    badgeColor: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
  },
  absent: {
    label: 'Ausente',
    icon: X,
    color: 'bg-red-100 hover:bg-red-200 text-red-800 border-red-300 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-200 dark:border-red-800',
    badgeColor: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
  },
  late: {
    label: 'Tardío',
    icon: Clock,
    color: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-800',
    badgeColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
  },
  excused: {
    label: 'Justificado',
    icon: FileText,
    color: 'bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200'
  }
};

export default function AttendanceTable({ 
  sectionId, 
  selectedDate, 
  isHoliday = false,
  holiday,
  onDateChange
}: AttendanceTableProps) {
  // 🎯 Estados locales
  const [searchQuery, setSearchQuery] = useState('');
  const [attendanceStates, setAttendanceStates] = useState<Record<number, AttendanceStatus>>({});
  const [savingStates, setSavingStates] = useState<Record<number, boolean>>({});
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);

  // 📄 Contextos
  const { fetchEnrollmentsBySection, state: enrollmentState } = useEnrollmentContext();
  const { 
    createAttendance, 
    updateAttendance,
    fetchAttendancesByBimester,
    state: attendanceState 
  } = useAttendanceContext();
  const { bimester: activeBimester } = useCurrentBimester();

  // 🧹 Limpiar estados de asistencia cuando cambia la fecha
  useEffect(() => {
    setAttendanceStates({});
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

    setAttendanceStates(prev => ({ ...prev, [enrollmentId]: status }));
    setSavingStates(prev => ({ ...prev, [enrollmentId]: true }));

    try {
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

  // 🎯 Funciones para selección múltiple y acciones masivas
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

  const handleBulkAction = async (enrollmentIds: number[], status: AttendanceStatus) => {
    if (!activeBimester?.id || isHoliday) return;

    const newStates = { ...attendanceStates };
    enrollmentIds.forEach(id => {
      newStates[id] = status;
    });
    setAttendanceStates(newStates);

    const savingState = { ...savingStates };
    enrollmentIds.forEach(id => {
      savingState[id] = true;
    });
    setSavingStates(savingState);

    try {
      for (const enrollmentId of enrollmentIds) {
        await handleAttendanceChange(enrollmentId, status);
      }
      setSelectedStudents([]);
    } catch (error) {
      enrollmentIds.forEach(id => {
        delete newStates[id];
      });
      setAttendanceStates(newStates);
      console.error('Error en acción masiva:', error);
    } finally {
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

  // ⏳ NUEVO: Estado de carga profesional
  if (enrollmentState.loading) {
    return (
      <LoadingTable 
        title="Cargando estudiantes..."
        description="Obteniendo la lista de estudiantes matriculados en la sección"
        skeletonItems={8}
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
        />
      );
    }
    
    if (errorMessage.includes('server') || errorMessage.includes('500')) {
      return (
        <ServerError 
          error={enrollmentState.error}
          onRetry={handleRetry}
          onContact={() => alert('Contacta al administrador del sistema')}
        />
      );
    }
    
    // Error genérico de carga
    return (
      <LoadFailedError 
        error={enrollmentState.error}
        onRetry={handleRetry}
        onReset={() => window.location.reload()}
      />
    );
  }

  // 📭 NUEVO: Estado vacío profesional
  if (enrollmentState.enrollments.length === 0) {
    return (
      <NoStudentsState 
        action={{
          label: "Recargar estudiantes",
          onClick: handleRetry,
          variant: "default"
        }}
        secondaryAction={{
          label: "Cambiar sección",
          onClick: () => window.history.back(),
          variant: "outline"
        }}
      />
    );
  }

  // 🔍 NUEVO: Sin resultados de búsqueda
  if (searchQuery && filteredStudents.length === 0) {
    return (
      <div className="space-y-4">
        {/* Mantener barra de búsqueda */}
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

        {/* Estado sin resultados */}
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
        allStudents={filteredStudents.map(s => s.id)}
        totalStudents={currentStats.total}
        onBulkAction={handleBulkAction}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        isProcessing={Object.values(savingStates).some(Boolean)}
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
                <Badge className={ATTENDANCE_CONFIG.present.badgeColor}>
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
            {filteredStudents.map((enrollment, index) => (
              <div
                key={enrollment.id}
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
                      {enrollment.student.codeSIRE && (
                        <>
                          <span>•</span>
                          <span>Código: {enrollment.student.codeSIRE}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {attendanceStates[enrollment.id] && (
                    <Badge className={ATTENDANCE_CONFIG[attendanceStates[enrollment.id]].badgeColor}>
                      {ATTENDANCE_CONFIG[attendanceStates[enrollment.id]].label}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {(Object.entries(ATTENDANCE_CONFIG) as [AttendanceStatus, typeof ATTENDANCE_CONFIG[AttendanceStatus]][]).map(([status, config]) => {
                    const Icon = config.icon;
                    const isActive = attendanceStates[enrollment.id] === status;
                    const isSaving = savingStates[enrollment.id] && attendanceStates[enrollment.id] === status;

                    return (
                      <Button
                        key={status}
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleAttendanceChange(enrollment.id, status)}
                        disabled={isSaving}
                        className={isActive ? config.color : "hover:bg-gray-100 dark:hover:bg-gray-800"}
                        title={config.label}
                      >
                        {isSaving ? (
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
            ))}
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