/**
 * ====================================================================
 * TAB 1 - REGISTRO DIARIO
 * ====================================================================
 *
 * Componente principal para registro diario masivo de asistencia
 * Permite cambiar estado de múltiples estudiantes y guardar en una sola petición
 *
 * Funcionalidad:
 * • Tabla con lista de estudiantes
 * • Seleccionar estado de asistencia por estudiante
 * • Botón "Registrar Asistencia" para guardar todo masivamente
 * • Mostrar feedback de éxito/error
 * • Validar permisos antes de permitir registros
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAttendanceContext } from '@/context/AttendanceContext';
import { useAuth } from '@/context/AuthContext';
import { useAttendanceValidations } from '@/hooks/data/attendance/useAttendanceValidations';
import { registerDailyAttendance, getAllowedAttendanceStatusesByRole, getSectionAttendanceConsolidatedView } from '@/services/attendance.service';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Loader2, Save, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExpandableStudentAttendanceTable } from './ExpandableStudentAttendanceTable';
import { ImprovedStudentAttendanceTable } from './ImprovedStudentAttendanceTable';
import { RegistrationSummary } from './RegistrationSummary';
import { ExistingAttendanceSummary } from './ExistingAttendanceSummary';
import type { DailyRegistrationPayload, AttendanceStatus, ConsolidatedAttendanceView } from '@/types/attendance.types';

interface StudentData {
  id?: number;
  name?: string;
  enrollmentId: number;
  enrollmentNumber?: string;
  email?: string;
  identificationNumber?: string;
}

interface StudentAttendance {
  enrollmentId: number;
  status: string;
  isEarlyExit: boolean;
  notes?: string;
}

interface DailyRegistrationProps {
  canCreate?: boolean;
  canCreateBulk?: boolean;
}

export function DailyRegistration({ canCreate = true, canCreateBulk = true }: DailyRegistrationProps) {
  const { state: attendanceState } = useAttendanceContext();
  const { user } = useAuth();
  const [validationState, validationActions] = useAttendanceValidations();
  
  // Estado local para registros de asistencia
  const [studentAttendance, setStudentAttendance] = useState<Map<number, StudentAttendance>>(new Map());
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<{
    success: boolean;
    message: string;
    details?: Record<string, unknown>;
  } | null>(null);
  const [allowedStatuses, setAllowedStatuses] = useState<AttendanceStatus[]>([]);
  const [hasPermission, setHasPermission] = useState(true);
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(true);
  const [existingAttendance, setExistingAttendance] = useState<Map<number, { statusId: number; isEarlyExit: boolean }>>(new Map());
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);
  const [consolidatedData, setConsolidatedData] = useState<ConsolidatedAttendanceView | null>(null);

  // Cargar estados permitidos y validar permisos
  useEffect(() => {
    // Si no authenticated yet, don't try to load
    if (!user || !user.role?.id) {
      setHasPermission(false);
      setIsLoadingStatuses(false);
      return;
    }

    const loadPermissions = async () => {
      try {
        const roleId = user?.role?.id;
        if (!roleId) {
          setHasPermission(false);
          setIsLoadingStatuses(false);
          return;
        }

        
        const statuses = await getAllowedAttendanceStatusesByRole(roleId);
        
        setAllowedStatuses(statuses || []);
        
        // Validar que tenga al menos un estado permitido
        if (!statuses || statuses.length === 0) {
          setHasPermission(false);
        } else {
          setHasPermission(true);
        }
      } catch (error) {
        setHasPermission(false);
        setAllowedStatuses([]);
      } finally {
        setIsLoadingStatuses(false);
      }
    };
    
    loadPermissions();
  }, [user?.role?.id, user]);

  // Función para recargar datos de asistencia existente
  const reloadExistingAttendance = useCallback(async () => {
    if (!attendanceState.selectedSectionId || !attendanceState.selectedDate) {
      setExistingAttendance(new Map());
      setConsolidatedData(null);
      return;
    }

    setIsLoadingExisting(true);
    try {
      const data = await getSectionAttendanceConsolidatedView(
        attendanceState.selectedSectionId!,
        attendanceState.selectedDate
      );
      
      const consolidatedView = data as unknown as ConsolidatedAttendanceView;
      
      // Guardar datos consolidados para mostrar en tabla expandible
      setConsolidatedData(consolidatedView);
      
      // Crear mapa de enrollmentId -> { statusId, isEarlyExit }
      const attendanceMap = new Map<number, { statusId: number; isEarlyExit: boolean }>();
      
      consolidatedView.students.forEach(student => {
        if (student.courses.length > 0) {
          const firstCourse = student.courses[0];
          const allowedStatus = allowedStatuses.find(s => s.code === firstCourse.currentStatus);
          
          attendanceMap.set(student.enrollmentId, {
            statusId: allowedStatus?.id || 0,
            isEarlyExit: false,
          });
        }
      });
      
      setExistingAttendance(attendanceMap);
    } catch (error) {
      setExistingAttendance(new Map());
      setConsolidatedData(null);
    } finally {
      setIsLoadingExisting(false);
    }
  }, [attendanceState.selectedSectionId, attendanceState.selectedDate, allowedStatuses]);

  // Cargar asistencias existentes cuando cambia la sección o fecha
  useEffect(() => {
    reloadExistingAttendance();
  }, [reloadExistingAttendance]);

  // Ejecutar validaciones previas cuando cambia la sección, ciclo o fecha
  useEffect(() => {
    if (!attendanceState.selectedCycleId) return;

    const runValidations = async () => {
      await validationActions.validate({
        cycleId: attendanceState.selectedCycleId || 0,
        bimesterId: attendanceState.selectedBimesterId || undefined,
        date: attendanceState.selectedDate,
        teacherId: undefined,
        roleId: user?.role?.id,
        sectionId: attendanceState.selectedSectionId || undefined,
        studentCount: attendanceState.students.length,
      });
    };

    runValidations();
  }, [
    attendanceState.selectedCycleId,
    attendanceState.selectedBimesterId,
    attendanceState.selectedDate,
    attendanceState.selectedSectionId,
    attendanceState.students.length,
    user?.role?.id,
    validationActions,
  ]);

  // Inicializar estudiantes en el mapa con asistencias existentes
  useEffect(() => {
    if (attendanceState.students && attendanceState.students.length > 0) {
      const newMap = new Map<number, StudentAttendance>();
      (attendanceState.students as unknown as StudentData[]).forEach((student: StudentData) => {
        const enrollmentId = student.enrollmentId as number;
        
        // Buscar si hay asistencia existente para este estudiante
        const existingRecord = existingAttendance.get(enrollmentId);
        
        if (!studentAttendance.has(enrollmentId)) {
          newMap.set(enrollmentId, {
            enrollmentId,
            status: existingRecord?.statusId?.toString() || '',
            isEarlyExit: existingRecord?.isEarlyExit || false,
          });
        }
      });

      if (newMap.size > 0) {
        setStudentAttendance(prev => new Map([...prev, ...newMap]));
      }
    }
  }, [attendanceState.students, existingAttendance]);

  // Actualizar estado de un estudiante
  const handleStatusChange = useCallback(
    (enrollmentId: number, status: string) => {
      setStudentAttendance(prev => {
        const updated = new Map(prev);
        const current = updated.get(enrollmentId);
        if (current) {
          updated.set(enrollmentId, { ...current, status });
        }
        return updated;
      });
    },
    []
  );

  // Cambiar early exit
  const handleEarlyExitToggle = useCallback(
    (enrollmentId: number, isEarlyExit: boolean) => {
      setStudentAttendance(prev => {
        const updated = new Map(prev);
        const current = updated.get(enrollmentId);
        if (current) {
          updated.set(enrollmentId, { ...current, isEarlyExit });
        }
        return updated;
      });
    },
    []
  );

  // Actualización masiva de estado
  const handleBulkStatusChange = useCallback(
    (enrollmentIds: number[], statusId: string) => {
      setStudentAttendance(prev => {
        const updated = new Map(prev);
        enrollmentIds.forEach(enrollmentId => {
          const current = updated.get(enrollmentId);
          if (current) {
            updated.set(enrollmentId, { ...current, status: statusId });
          }
        });
        return updated;
      });
      
      // Mostrar feedback
      setRegistrationResult({
        success: true,
        message: `✅ Estado actualizado para ${enrollmentIds.length} estudiante(s)`,
      });
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setRegistrationResult(null), 3000);
    },
    []
  );

  // Registrar asistencia
  const handleRegisterAttendance = async () => {
    if (!attendanceState.selectedSectionId || !attendanceState.selectedDate) {
      setRegistrationResult({
        success: false,
        message: 'Falta seleccionar sección y fecha',
      });
      return;
    }

    setIsRegistering(true);
    setRegistrationResult(null);

    try {
      // Construir enrollmentStatuses con statusId
      const enrollmentStatuses: Record<number, number> = {};
      Array.from(studentAttendance.values()).forEach(att => {
        if (att.status) {
          // Convertir status string a number (ID)
          const statusId = parseInt(att.status, 10) || 0;
          if (statusId > 0) {
            enrollmentStatuses[att.enrollmentId] = statusId;
          }
        }
      });

      if (Object.keys(enrollmentStatuses).length === 0) {
        setRegistrationResult({
          success: false,
          message: 'Debes marcar asistencia para al menos un estudiante',
        });
        setIsRegistering(false);
        return;
      }

      const payload: DailyRegistrationPayload = {
        sectionId: attendanceState.selectedSectionId,
        date: attendanceState.selectedDate,
        enrollmentStatuses,
      };

      const result = await registerDailyAttendance(payload);

      setRegistrationResult({
        success: true,
        message: `✅ Asistencia registrada exitosamente`,
        details: result as unknown as Record<string, unknown>,
      });

      // Recargar datos consolidados después del registro exitoso
      await reloadExistingAttendance();
    } catch (error) {
      setRegistrationResult({
        success: false,
        message: error instanceof Error ? error.message : 'Error al registrar asistencia',
      });
    } finally {
      setIsRegistering(false);
    }
  };

  if (!attendanceState.students || attendanceState.students.length === 0) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-900">
          No hay estudiantes en la sección seleccionada
        </AlertDescription>
      </Alert>
    );
  }

  // ✅ Validar permisos
  if (!hasPermission || isLoadingStatuses) {
    return (
      <Alert className={isLoadingStatuses ? 'border-blue-200 bg-blue-50' : 'border-red-200 bg-red-50'}>
        <AlertCircle className={isLoadingStatuses ? 'h-4 w-4 text-blue-600' : 'h-4 w-4 text-red-600'} />
        <AlertDescription className={isLoadingStatuses ? 'text-blue-900' : 'text-red-900'}>
          {isLoadingStatuses 
            ? 'Cargando permisos y estados de asistencia...' 
            : 'No tienes permiso para registrar asistencia. Contacta al administrador.'}
        </AlertDescription>
      </Alert>
    );
  }

  const students = attendanceState.students as unknown as StudentData[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Registro Diario de Asistencia</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Selecciona el estado de asistencia para cada estudiante y guarda los cambios
          </p>
        </div>
        <Button
          onClick={() => reloadExistingAttendance()}
          disabled={isLoadingExisting || isRegistering}
          variant="outline"
          size="sm"
          className="gap-2 whitespace-nowrap"
        >
          <RefreshCw className={`h-4 w-4 ${isLoadingExisting ? 'animate-spin' : ''}`} />
          {isLoadingExisting ? 'Recargando...' : 'Recargar'}
        </Button>
      </div>

      {/* Validaciones Previas - Mostrar alertas de validaciones fallidas */}
      {validationState.isComplete && validationState.results.length > 0 && (
        <>
          {/* Alert de éxito si todas pasaron */}
          {validationState.results.every(r => r.passed) && (
            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-900 dark:text-green-100">
                Todas las validaciones previas pasaron. Listo para registrar.
              </AlertDescription>
            </Alert>
          )}

          {/* Alertas de validaciones fallidas */}
          {validationState.results.filter(r => !r.passed).map(result => (
            <Alert key={result.id} className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-900 dark:text-red-100">
                <span className="font-medium">{result.name}:</span> {result.message || 'Validación fallida'}
              </AlertDescription>
            </Alert>
          ))}
        </>
      )}

      {/* Alerta si hay asistencias ya registradas */}
      {existingAttendance.size > 0 && (
        <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
          <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-900 dark:text-blue-100">
            <CheckCircle2 className="h-4 w-4 inline mr-1" />
            <span className="font-medium">{existingAttendance.size} estudiante(s)</span> ya tienen asistencia registrada para esta fecha. Estos registros aparecen pre-cargados en la tabla.
          </AlertDescription>
        </Alert>
      )}

      {/* Resultado del registro */}
      {registrationResult && (
        <Alert
          className={
            registrationResult.success
              ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30'
              : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30'
          }
        >
          {registrationResult.success ? (
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          )}
          <AlertDescription
            className={registrationResult.success ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}
          >
            {registrationResult.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Tabla de estudiantes con vista expandible */}
      <ImprovedStudentAttendanceTable
        students={students}
        studentAttendance={studentAttendance}
        onStatusChange={handleStatusChange}
        onEarlyExitToggle={handleEarlyExitToggle}
        onBulkStatusChange={handleBulkStatusChange}
        allowedStatuses={allowedStatuses}
        isLoading={isRegistering}
        existingAttendance={existingAttendance}
      />

      {/* Resumen de asistencias ya registradas */}
      <ExistingAttendanceSummary
        existingAttendance={existingAttendance}
        allowedStatuses={allowedStatuses}
        consolidatedData={consolidatedData || undefined}
      />

      {/* Resumen y botón de guardar */}
      <div className="space-y-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-lg">
        <RegistrationSummary
          totalStudents={students.length}
          registeredStudents={Array.from(studentAttendance.values()).filter(
            att => att.status
          ).length}
          statuses={Array.from(studentAttendance.values())
            .filter(att => att.status)
            .map(att => {
              const statusId = parseInt(att.status);
              return allowedStatuses.find(s => s.id === statusId)!;
            })
            .filter(Boolean)}
          existingCount={existingAttendance.size}
          existingStatuses={Array.from(existingAttendance.values())
            .map(att => allowedStatuses.find(s => s.id === att.statusId)!)
            .filter(Boolean)}
        />

        <button
          onClick={handleRegisterAttendance}
          disabled={isRegistering || Array.from(studentAttendance.values()).every(att => !att.status)}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
        >
          {isRegistering ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Registrando...
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              Registrar Asistencia
            </>
          )}
        </button>
      </div>
    </div>
  );
}
