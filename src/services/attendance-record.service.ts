// src/services/attendance-record.service.ts
// ✅ Servicio para crear/actualizar registros de asistencia
import { api } from '@/config/api';

export const attendanceRecordService = {
  /**
   * Obtener registros de asistencia detallados para una fecha específica
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
      const url = `/api/attendance/section/${sectionId}/cycle/${cycleId}/date/${date}`;
      console.table({ endpoint: url });

      const response = await api.get<{ success: boolean; data: any[]; message?: string }>(url);


      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al cargar asistencia');
      }

      return response.data.data || [];
    } catch (error) {
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
      const payload = {
        attendanceStatusId: statusId,
        changeReason: reason,
      };

      console.table({ endpoint: url, payload });

      const response = await api.patch<{ success: boolean; data: any; message?: string }>(url, payload);


      if (!response.data?.success) {
        const errorMessage = response.data?.message || 'Error al actualizar asistencia';
        const error: any = new Error(errorMessage);
        error.response = { data: response.data };
        throw error;
      }

      return response.data.data;
    } catch (error: any) {
      
      // Propagar el error con toda la información
      if (error?.response?.data) {
        throw error;
      }
      
      throw error;
    }
  },

  /**
   * Crear registro de asistencia para UN ESTUDIANTE ESPECÍFICO
   * @param enrollmentId ID de la matrícula del estudiante
   * @param date Fecha en formato YYYY-MM-DD
   * @param statusId ID del estado de asistencia
   * @param arrivalTime Hora de llegada opcional (HH:MM)
   */
  async createSingleAttendance(
    enrollmentId: number,
    date: string,
    statusId: number,
    arrivalTime?: string
  ): Promise<any> {
    try {
      const url = `/api/attendance/single`;
      const payload = {
        enrollmentId,
        date,
        attendanceStatusId: statusId,
        arrivalTime: arrivalTime || null,
      };

      console.table({ endpoint: url, payload });

      const response = await api.post<{ success: boolean; data: any; message?: string }>(url, payload);


      if (!response.data?.success) {
        const errorMessage = response.data?.message || 'Error al crear asistencia';
        const error: any = new Error(errorMessage);
        error.response = { data: response.data };
        throw error;
      }

      return response.data.data;
    } catch (error: any) {
      
      if (error?.response?.data) {
        throw error;
      }
      
      throw error;
    }
  },

  /**
   * Crear registro de asistencia masivo
   * @param sectionId ID de la sección
   * @param gradeId ID del grado
   * @param date Fecha en formato YYYY-MM-DD
   * @param statusId ID del estado
   * @param notes Notas opcionales
   */
  async bulkCreateAttendance(
    sectionId: number,
    gradeId: number,
    date: string,
    statusId: number,
    notes?: string
  ): Promise<any> {
    try {
      const url = `/api/attendance/register`;
      const payload = {
        sectionId,
        gradeId,
        date,
        attendanceStatusId: statusId,
        notes,
      };

      console.table({ endpoint: url, payload });

      const response = await api.post<{ success: boolean; data: any; message?: string }>(url, payload);


      if (!response.data?.success) {
        const errorMessage = response.data?.message || 'Error al crear asistencia';
        const error: any = new Error(errorMessage);
        error.response = { data: response.data };
        throw error;
      }

      return response.data.data;
    } catch (error: any) {
      
      // Propagar el error con toda la información
      if (error?.response?.data) {
        throw error;
      }
      
      throw error;
    }
  },
};
