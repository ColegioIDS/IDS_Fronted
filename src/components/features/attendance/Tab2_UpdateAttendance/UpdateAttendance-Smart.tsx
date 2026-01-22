'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAttendanceContext } from '@/context/AttendanceContext';
import { useAuth } from '@/context/AuthContext';
import { ConsolidatedAttendanceViewComponent } from './ConsolidatedAttendanceView';
import { ConsolidatedAttendanceView, AttendanceStatus } from '@/types/attendance.types';
import attendanceService from '@/services/attendance.service';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, RefreshCw, Info, FileText, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UpdateAttendanceTabSmartEditProps {
  canUpdate?: boolean;
  canDelete?: boolean;
}

/**
 * TAB 2 - ACTUALIZAR ASISTENCIA (OPCIÓN C: SMART EDIT)
 * 
 * Características:
 * - Vista consolidada con edición inline
 * - Los usuarios pueden hacer clic en Edit para cambiar el estado
 * - Guardan cambios directamente sin modal
 * - Razón/motivo del cambio capturado
 * - Recarga automática después de guardar
 * - Mensajes de éxito/error integrados
 * 
 * Permisos:
 * - canUpdate: Permite actualizar registros de asistencia
 * - canDelete: Permite eliminar registros
 */
export function UpdateAttendanceTabSmartEdit({
  canUpdate = true,
  canDelete = true,
}: UpdateAttendanceTabSmartEditProps) {
  const { state: attendanceState } = useAttendanceContext();
  const { user } = useAuth();
  
  const [consolidatedData, setConsolidatedData] = useState<ConsolidatedAttendanceView | null>(null);
  const [allowedStatuses, setAllowedStatuses] = useState<AttendanceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReloading, setIsReloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Función para recargar datos consolidados
  const reloadData = useCallback(async () => {
    try {
      setIsReloading(true);
      setError(null);

      if (!attendanceState.selectedSectionId || !attendanceState.selectedDate) {
        setError('Debes seleccionar una sección y una fecha');
        return;
      }

      // Obtener datos consolidados
      const data = await attendanceService.getSectionAttendanceConsolidatedView(
        Number(attendanceState.selectedSectionId),
        attendanceState.selectedDate,
        user?.id ? Number(user.id) : undefined
      ) as unknown as ConsolidatedAttendanceView;
      setConsolidatedData(data);

      // Obtener estatuses permitidos según el rol
      const statuses = await attendanceService.getAllowedAttendanceStatusesByRole(
        user?.role?.id || 0
      );
      setAllowedStatuses(statuses);
    } catch (err) {
      setError('Error al cargar los datos de asistencia. Intenta nuevamente.');
    } finally {
      setIsReloading(false);
    }
  }, [attendanceState.selectedSectionId, attendanceState.selectedDate, user?.role?.id, user?.id]);

  // Cargar datos consolidados y estatuses permitidos
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        if (!attendanceState.selectedSectionId || !attendanceState.selectedDate) {
          // No mostrar error si no hay selección, solo detener carga
          setLoading(false);
          return;
        }

        await reloadData();
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [attendanceState.selectedSectionId, attendanceState.selectedDate, user?.role?.id, reloadData]);

  // Manejador para actualizar el estado de asistencia
  const handleStatusUpdate = async (
    classAttendanceId: number,
    newStatusId: number,
    reason?: string
  ) => {
    try {
      setError(null);
      setSuccessMessage(null);

      // Llamar al servicio para actualizar la asistencia
      // El servicio ahora recibe classAttendanceId en lugar de enrollmentId y courseId
      await attendanceService.updateAttendanceStatus(
        classAttendanceId,
        newStatusId,
        reason || 'Estado modificado'
      );

      // Recargar datos consolidados
      if (attendanceState.selectedSectionId && attendanceState.selectedDate) {
        await reloadData();
      }

      setSuccessMessage('Estado actualizado correctamente');
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      
      // Mejorar mensajes de error basados en la respuesta del servidor
      let errorMessage = 'Error al actualizar el estado. Intenta nuevamente.';
      
      // Intentar obtener el mensaje del backend
      const backendMessage = 
        err.response?.data?.message || 
        err.response?.data?.error ||
        err.message ||
        '';
      
      
      if (backendMessage) {
        // Mapear mensajes comunes del backend a mensajes más descriptivos
        if (backendMessage.toLowerCase().includes('permiso')) {
          errorMessage = `❌ Permiso Denegado\n\n"${backendMessage}"\n\nContacta al administrador para obtener permisos.`;
        } else if (backendMessage.toLowerCase().includes('no encontrado') || backendMessage.toLowerCase().includes('not found')) {
          errorMessage = `⚠️ Registro no encontrado\n\n"${backendMessage}"\n\nIntenta recargar los datos.`;
        } else if (backendMessage.toLowerCase().includes('validación') || backendMessage.toLowerCase().includes('validation')) {
          errorMessage = `⚠️ Error de validación\n\n"${backendMessage}"`;
        } else if (backendMessage.toLowerCase().includes('duplicado') || backendMessage.toLowerCase().includes('duplicate')) {
          errorMessage = `⚠️ Cambio duplicado\n\n"${backendMessage}"`;
        } else {
          // Usar el mensaje del backend directamente
          errorMessage = `⚠️ ${backendMessage}`;
        }
      } else if (err.response?.status === 403) {
        errorMessage = `❌ Permiso Denegado\n\nNo tienes permiso para realizar esta acción. Contacta al administrador.`;
      } else if (err.response?.status === 404) {
        errorMessage = `⚠️ Registro no encontrado\n\nIntenta recargar los datos.`;
      } else if (err.response?.status === 400) {
        errorMessage = `⚠️ Datos inválidos\n\nVerifica el estado y el motivo.`;
      } else if (err.response?.status === 500) {
        errorMessage = `❌ Error en el servidor\n\nIntenta más tarde.`;
      } else if (err.message?.includes('Network')) {
        errorMessage = `⚠️ Error de conexión\n\nVerifica tu internet.`;
      }
      
      setError(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-xl border-2 border-blue-200 bg-blue-50 p-12 shadow-lg dark:border-blue-800 dark:bg-blue-950/30">
        <div className="space-y-4 text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 dark:border-blue-700 dark:border-t-blue-400" />
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Cargando datos de asistencia...
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Esto puede tomar unos segundos</p>
        </div>
      </div>
    );
  }

  // Mostrar mensaje informativo si no hay selección de sección/fecha
  if (!attendanceState.selectedSectionId || !attendanceState.selectedDate) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-xl border-2 border-blue-200 bg-blue-50 p-12 shadow-lg dark:border-blue-800 dark:bg-blue-950/30">
        <div className="mx-auto flex max-w-md flex-col items-center space-y-4 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl dark:bg-blue-500">
            <Info className="h-12 w-12" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Selecciona Sección y Fecha
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Para gestionar la asistencia por curso, primero selecciona una sección y una fecha en los filtros superiores
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alertas */}
      {error && (
        <Alert className="animate-in fade-in-50 slide-in-from-top-5 border-2 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <AlertDescription className="font-medium text-red-900 dark:text-red-100 whitespace-pre-line">{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="animate-in fade-in-50 slide-in-from-top-5 border-2 border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30">
          <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <AlertDescription className="font-medium text-emerald-900 dark:text-emerald-100">{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Header con Título */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Gestión por Curso</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Visualiza y edita la asistencia de todos los estudiantes por curso
          </p>
        </div>
        <Button
          onClick={() => reloadData()}
          disabled={isReloading || loading}
          className="gap-2 whitespace-nowrap bg-blue-600 shadow-md hover:bg-blue-700 hover:shadow-lg transition-all"
        >
          <RefreshCw className={`h-4 w-4 ${isReloading ? 'animate-spin' : ''}`} />
          {isReloading ? 'Recargando...' : 'Recargar'}
        </Button>
      </div>

      {/* Instrucciones */}
      <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-5 shadow-md dark:border-indigo-800 dark:bg-indigo-950/30">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md dark:bg-indigo-500">
            <Info className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-indigo-900 dark:text-indigo-100">
              Edición Rápida Activada
            </p>
            <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">
              Haz clic en el botón <span className="inline-flex items-center gap-1 rounded bg-blue-100 dark:bg-blue-900 px-2 py-0.5 font-medium"><Edit2 className="h-3 w-3" />Editar</span> para modificar el estado de asistencia de cualquier estudiante
            </p>
          </div>
        </div>
      </div>

      {/* Componente principal */}
      {consolidatedData ? (
        <ConsolidatedAttendanceViewComponent
          data={consolidatedData}
          allowedStatuses={allowedStatuses}
          onStatusUpdate={handleStatusUpdate}
        />
      ) : (
        <div className="rounded-xl border-2 border-gray-200 bg-white p-12 text-center shadow-lg dark:border-gray-700 dark:bg-gray-900">
          <div className="mx-auto flex max-w-md flex-col items-center space-y-4">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl dark:bg-indigo-500">
              <FileText className="h-12 w-12" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Sin Datos de Asistencia
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              No hay registros de asistencia para la fecha seleccionada
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Primero registra asistencia en la pestaña "Registro Diario"
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
