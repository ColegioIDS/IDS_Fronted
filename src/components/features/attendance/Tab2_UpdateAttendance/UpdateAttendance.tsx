/**
 * TAB 2 - ACTUALIZAR ASISTENCIA
 * Vista consolidada para ver y actualizar asistencias registradas
 */

'use client';

import { useEffect, useState } from 'react';
import { useAttendanceContext } from '@/context/AttendanceContext';
import { useAuth } from '@/context/AuthContext';
import { getSectionAttendanceConsolidatedView, getAllowedAttendanceStatusesByRole } from '@/services/attendance.service';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { ConsolidatedAttendanceViewComponent } from './ConsolidatedAttendanceView';
import type { ConsolidatedAttendanceView, AttendanceStatus } from '@/types/attendance.types';

export function UpdateAttendance() {
  const { state: attendanceState } = useAttendanceContext();
  const { user } = useAuth();

  const [consolidatedData, setConsolidatedData] = useState<ConsolidatedAttendanceView | null>(null);
  const [allowedStatuses, setAllowedStatuses] = useState<AttendanceStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar estados permitidos
  useEffect(() => {
    if (!user?.role?.id) return;

    const loadStatuses = async () => {
      try {
        const roleId = user.role?.id;
        if (!roleId) return;
        
        const statuses = await getAllowedAttendanceStatusesByRole(roleId);
        setAllowedStatuses(statuses || []);
      } catch (err) {
      }
    };

    loadStatuses();
  }, [user?.role?.id]);

  // Cargar vista consolidada
  useEffect(() => {
    if (!attendanceState.selectedSectionId || !attendanceState.selectedDate) {
      setConsolidatedData(null);
      setError(null);
      return;
    }

    const loadConsolidatedView = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getSectionAttendanceConsolidatedView(
          attendanceState.selectedSectionId!,
          attendanceState.selectedDate,
          user?.id
        );
        
        setConsolidatedData(data as unknown as ConsolidatedAttendanceView);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al cargar asistencia';
        setError(message);
        setConsolidatedData(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadConsolidatedView();
  }, [attendanceState.selectedSectionId, attendanceState.selectedDate, user?.id]);

  // Validar selecciones
  if (!attendanceState.selectedSectionId || !attendanceState.selectedDate) {
    return (
      <Alert className="border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900">
          Por favor selecciona una sección y fecha para ver la asistencia registrada
        </AlertDescription>
      </Alert>
    );
  }

  // Mostrar loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="space-y-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600">Cargando datos de asistencia...</p>
        </div>
      </div>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-900">
          Error: {error}
        </AlertDescription>
      </Alert>
    );
  }

  // Mostrar datos
  if (!consolidatedData) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-900">
          No hay registros de asistencia para esta fecha
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">Actualizar Asistencia</h3>
        <p className="text-sm text-gray-600">
          Vista consolidada de asistencia registrada. Puedes expandir cada estudiante para ver detalles de sus cursos.
        </p>
      </div>

      {/* Componente de vista consolidada */}
      <ConsolidatedAttendanceViewComponent
        data={consolidatedData}
        allowedStatuses={allowedStatuses}
      />
    </div>
  );
}
