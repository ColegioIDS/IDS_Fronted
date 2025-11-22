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
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAttendanceContext } from '@/context/AttendanceContext';
import { useAuth } from '@/context/AuthContext';
import { registerDailyAttendance, getAllowedAttendanceStatusesByRole } from '@/services/attendance.service';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Loader2, Save } from 'lucide-react';
import { StudentAttendanceTable } from './StudentAttendanceTable';
import { RegistrationSummary } from './RegistrationSummary';
import type { DailyRegistrationPayload, AttendanceStatus } from '@/types/attendance.types';

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

export function DailyRegistration() {
  const { state: attendanceState } = useAttendanceContext();
  const { user } = useAuth();
  
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

  // Cargar estados permitidos y validar permisos
  useEffect(() => {
    const loadPermissions = async () => {
      try {
        // ✅ Obtener roleId del usuario autenticado
        const roleId = user?.role?.id;
        
        if (!roleId) {
          console.warn('No roleId found in authenticated user');
          setHasPermission(false);
          setIsLoadingStatuses(false);
          return;
        }

        const statuses = await getAllowedAttendanceStatusesByRole(roleId);
        setAllowedStatuses(statuses); // ✅ Ya es AttendanceStatus[]
        
        // Validar que tenga al menos un estado permitido
        if (!statuses || statuses.length === 0) {
          setHasPermission(false);
        } else {
          setHasPermission(true); // ✅ Asegurar que se establece true si hay permisos
        }
      } catch (error) {
        console.error('Error loading permissions:', error);
        setHasPermission(false);
        setAllowedStatuses([]);
      } finally {
        setIsLoadingStatuses(false);
      }
    };
    
    loadPermissions();
  }, [user?.role?.id]);

  // Inicializar estudiantes en el mapa
  useEffect(() => {
    if (attendanceState.students && attendanceState.students.length > 0) {
      const newMap = new Map<number, StudentAttendance>();
      (attendanceState.students as unknown as StudentData[]).forEach((student: StudentData) => {
        const enrollmentId = student.enrollmentId as number;
        if (!studentAttendance.has(enrollmentId)) {
          newMap.set(enrollmentId, {
            enrollmentId,
            status: '',
            isEarlyExit: false,
          });
        }
      });

      if (newMap.size > 0) {
        setStudentAttendance(prev => new Map([...prev, ...newMap]));
      }
    }
  }, [attendanceState.students, studentAttendance]);

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

      // Limpiar form después de 2 segundos
      setTimeout(() => {
        setStudentAttendance(new Map());
      }, 2000);
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
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">Registro Diario de Asistencia</h3>
        <p className="text-sm text-gray-600">
          Selecciona el estado de asistencia para cada estudiante y guarda los cambios
        </p>
      </div>

      {/* Resultado del registro */}
      {registrationResult && (
        <Alert
          className={
            registrationResult.success
              ? 'border-green-200 bg-green-50'
              : 'border-red-200 bg-red-50'
          }
        >
          {registrationResult.success ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription
            className={registrationResult.success ? 'text-green-900' : 'text-red-900'}
          >
            {registrationResult.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Tabla de estudiantes */}
      <StudentAttendanceTable
        students={students}
        studentAttendance={studentAttendance}
        onStatusChange={handleStatusChange}
        onEarlyExitToggle={handleEarlyExitToggle}
        allowedStatuses={allowedStatuses}
        isLoading={isRegistering}
      />

      {/* Resumen y botón de guardar */}
      <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
        <RegistrationSummary
          totalStudents={students.length}
          registeredStudents={Array.from(studentAttendance.values()).filter(
            att => att.status
          ).length}
          statuses={Array.from(studentAttendance.values())
            .filter(att => att.status)
            .map(att => att.status)}
        />

        <button
          onClick={handleRegisterAttendance}
          disabled={isRegistering || Array.from(studentAttendance.values()).every(att => !att.status)}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
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
