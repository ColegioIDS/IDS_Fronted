'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAttendanceContext } from '@/context/AttendanceContext';
import { useAuth } from '@/context/AuthContext';
import { ConsolidatedAttendanceViewComponent } from './ConsolidatedAttendanceView';
import { ConsolidatedAttendanceView, AttendanceStatus } from '@/types/attendance.types';
import attendanceService from '@/services/attendance.service';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, RefreshCw, Info, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
 */
export function UpdateAttendanceTabSmartEdit() {
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
        attendanceState.selectedSectionId,
        attendanceState.selectedDate
      ) as unknown as ConsolidatedAttendanceView;
      setConsolidatedData(data);

      // Obtener estatuses permitidos según el rol
      const statuses = await attendanceService.getAllowedAttendanceStatusesByRole(
        user?.role?.id || 0
      );
      setAllowedStatuses(statuses);
    } catch (err) {
      console.error('Error loading attendance data:', err);
      setError('Error al cargar los datos de asistencia. Intenta nuevamente.');
    } finally {
      setIsReloading(false);
    }
  }, [attendanceState.selectedSectionId, attendanceState.selectedDate, user?.role?.id]);

  // Cargar datos consolidados y estatuses permitidos
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        if (!attendanceState.selectedSectionId || !attendanceState.selectedDate) {
          setError('Debes seleccionar una sección y una fecha');
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
      console.error('Error updating attendance status:', err);
      console.error('Full error object:', err);
      
      // Mejorar mensajes de error basados en la respuesta del servidor
      let errorMessage = 'Error al actualizar el estado. Intenta nuevamente.';
      
      // Intentar obtener el mensaje del backend
      const backendMessage = 
        err.response?.data?.message || 
        err.response?.data?.error ||
        err.message ||
        '';
      
      console.log('Backend message:', backendMessage);
      
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
      <div className="flex min-h-[400px] items-center justify-center rounded-xl border-2 border-blue-200 bg-blue-50 p-12 dark:border-blue-800 dark:bg-blue-950/20">
        <div className="space-y-4 text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
            Cargando datos de asistencia...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alertas */}
      {error && (
        <Alert className="animate-in fade-in-50 slide-in-from-top-5 border-l-4 border-red-500 bg-red-50 dark:bg-red-950/20">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <AlertDescription className="font-medium text-red-900 dark:text-red-100 whitespace-pre-line">{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="animate-in fade-in-50 slide-in-from-top-5 border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20">
          <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <AlertDescription className="font-medium text-emerald-900 dark:text-emerald-100">{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Instrucciones + Botón Reload */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 rounded-xl border-2 border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-800 dark:bg-cyan-950/20">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-600 text-white shadow-md dark:bg-cyan-500">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-cyan-900 dark:text-cyan-100">
                Edición Rápida Activada
              </p>
              <p className="text-sm text-cyan-700 dark:text-cyan-300">
                Haz clic en <strong>Editar</strong> para cambiar el estado de asistencia
              </p>
            </div>
          </div>
        </div>
        <Button
          onClick={() => reloadData()}
          disabled={isReloading || loading}
          className="gap-2 whitespace-nowrap bg-blue-600 shadow-md hover:bg-blue-700"
        >
          <RefreshCw className={`h-4 w-4 ${isReloading ? 'animate-spin' : ''}`} />
          {isReloading ? 'Recargando...' : 'Recargar'}
        </Button>
      </div>

      {/* Componente principal */}
      {consolidatedData ? (
        <ConsolidatedAttendanceViewComponent
          data={consolidatedData}
          allowedStatuses={allowedStatuses}
          onStatusUpdate={handleStatusUpdate}
        />
      ) : (
        <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-12 text-center dark:border-blue-800 dark:bg-blue-950/20">
          <div className="mx-auto flex max-w-md flex-col items-center space-y-4">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg">
              <FileText className="h-12 w-12" />
            </div>
            <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              Sin Datos de Asistencia
            </h3>
            <p className="text-blue-700 dark:text-blue-300">
              No hay registros de asistencia para esta fecha
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
