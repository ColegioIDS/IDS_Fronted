'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAttendanceContext } from '@/context/AttendanceContext';
import { useAuth } from '@/context/AuthContext';
import { ConsolidatedAttendanceViewComponent } from './ConsolidatedAttendanceView';
import { ConsolidatedAttendanceView, AttendanceStatus } from '@/types/attendance.types';
import attendanceService from '@/services/attendance.service';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
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

      setSuccessMessage(`✓ Estado actualizado correctamente`);
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error updating attendance status:', err);
      setError('Error al actualizar el estado. Intenta nuevamente.');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-12 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20">
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
        <Alert className="animate-in fade-in-50 slide-in-from-top-5 border-l-4 border-red-500 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <AlertDescription className="font-medium text-red-900 dark:text-red-100">{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="animate-in fade-in-50 slide-in-from-top-5 border-l-4 border-emerald-500 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <AlertDescription className="font-medium text-emerald-900 dark:text-emerald-100">{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Instrucciones + Botón Reload */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 rounded-xl border-2 border-cyan-200 bg-gradient-to-r from-cyan-50 via-blue-50 to-indigo-50 p-4 dark:from-cyan-950/20 dark:via-blue-950/20 dark:to-indigo-950/20 dark:border-cyan-800">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 p-2 shadow-lg">
              <AlertCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-cyan-900 dark:text-cyan-100">
                💡 Edición Rápida Activada
              </p>
              <p className="text-sm text-cyan-700 dark:text-cyan-300">
                Haz clic en <strong className="text-cyan-900 dark:text-cyan-100">✏️ Editar</strong> para cambiar el estado de asistencia
              </p>
            </div>
          </div>
        </div>
        <Button
          onClick={() => reloadData()}
          disabled={isReloading || loading}
          className="gap-2 whitespace-nowrap bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg hover:from-blue-700 hover:to-indigo-700"
        >
          <RefreshCw className={`h-4 w-4 ${isReloading ? 'animate-spin' : ''}`} />
          {isReloading ? 'Recargando...' : '🔄 Recargar'}
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
        <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-12 text-center dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20">
          <div className="space-y-3">
            <div className="text-7xl">📋</div>
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
