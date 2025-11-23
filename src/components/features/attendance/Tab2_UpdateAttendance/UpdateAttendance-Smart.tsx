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
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Cargando datos de asistencia...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Alertas */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-900">{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-900">{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Instrucciones + Botón Reload */}
      <div className="flex items-center justify-between gap-4">
        <Alert className="border-blue-200 bg-blue-50 flex-1">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            💡 Haz clic en el botón <strong>✏️ Editar</strong> para cambiar el estado de cada asistencia
          </AlertDescription>
        </Alert>
        <Button
          onClick={() => reloadData()}
          disabled={isReloading || loading}
          variant="outline"
          size="sm"
          className="gap-2 whitespace-nowrap"
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
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            No hay datos de asistencia para mostrar en esta fecha
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
