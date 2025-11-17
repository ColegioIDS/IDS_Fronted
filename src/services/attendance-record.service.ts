// src/services/attendance-record.service.ts
// ✅ Servicio para crear/actualizar registros de asistencia
import { api } from '@/config/api';

export const attendanceRecordService = {
  /**
   * Obtener registros de asistencia para una fecha específica
   * @param sectionId ID de la sección
   * @param cycleId ID del ciclo
   * @param date Fecha en formato YYYY-MM-DD
   */
  async getAttendanceByDate(
    sectionId: number,
    cycleId: number,
    date: string
  ): Promise<any[]> {
    try {
      const url = `/api/attendance/enrollment/section/${sectionId}/cycle/${cycleId}/active`;
      console.log('[attendanceRecordService] getAttendanceByDate URL:', url, 'date:', date);

      const response = await api.get<{ success: boolean; data: any[]; count: number; message?: string }>(url, {
        params: { date },
      });

      console.log('[attendanceRecordService] getAttendanceByDate response:', response.data);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al cargar asistencia');
      }

      return response.data.data || [];
    } catch (error) {
      console.error('[attendanceRecordService] Error getting attendance:', error);
      throw error;
    }
  },

  /**
   * Actualizar estado de asistencia para un estudiante
   * @param attendanceId ID del registro de asistencia
   * @param statusId ID del estado (1=Presente, 2=Ausente, 3=Tarde)
   * @param reason Motivo del cambio (OBLIGATORIO)
   */
  async updateAttendanceStatus(
    attendanceId: number,
    statusId: number,
    reason: string
  ): Promise<any> {
    try {
      const url = `/api/attendance/${attendanceId}`;
      console.log('[attendanceRecordService] updateAttendanceStatus URL:', url);

      const payload = {
        attendanceStatusId: statusId,
        changeReason: reason,
      };

      console.log('[attendanceRecordService] Payload:', payload);

      const response = await api.patch<{ success: boolean; data: any; message?: string }>(url, payload);

      console.log('[attendanceRecordService] updateAttendanceStatus response:', response.data);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al actualizar asistencia');
      }

      return response.data.data;
    } catch (error) {
      console.error('[attendanceRecordService] Error updating attendance:', error);
      throw error;
    }
  },

  /**
   * Crear registro de asistencia masivo
   * @param sectionId ID de la sección
   * @param date Fecha en formato YYYY-MM-DD
   * @param statusId ID del estado
   * @param notes Notas opcionales
   */
  async bulkCreateAttendance(
    sectionId: number,
    date: string,
    statusId: number,
    notes?: string
  ): Promise<any> {
    try {
      const url = `/api/attendance/register`;
      console.log('[attendanceRecordService] bulkCreateAttendance URL:', url);

      const payload = {
        sectionId,
        date,
        attendanceStatusId: statusId,
        notes,
      };

      console.log('[attendanceRecordService] Payload:', payload);

      const response = await api.post<{ success: boolean; data: any; message?: string }>(url, payload);

      console.log('[attendanceRecordService] bulkCreateAttendance response:', response.data);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al crear asistencia');
      }

      return response.data.data;
    } catch (error) {
      console.error('[attendanceRecordService] Error creating attendance:', error);
      throw error;
    }
  },
};
