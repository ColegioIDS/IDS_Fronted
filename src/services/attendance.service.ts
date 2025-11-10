// src/services/attendance.service.ts
import { api } from '@/config/api';
import {
  StudentAttendance,
  StudentAttendanceWithRelations,
  PaginatedAttendance,
  AttendanceQuery,
  AttendanceQueryWithScope,
  CreateAttendanceDto,
  UpdateAttendanceDto,
  BulkCreateAttendanceDto,
  BulkUpdateAttendanceDto,
  BulkDeleteAttendanceDto,
  BulkApplyStatusDto,
  BulkAttendanceResponse,
  StudentJustification,
  CreateJustificationDto,
  UpdateJustificationDto,
  CreateClassAttendanceDto,
  StudentClassAttendance,
  AttendanceReport,
  AttendanceStats,
  AttendanceStatusCode,
  BulkAttendanceByCourseDto,
} from '@/types/attendance.types';

export const attendanceService = {
  /**
   * Obtener asistencias paginadas con filtros avanzados
   */
  async getAttendances(
    query: AttendanceQuery | AttendanceQueryWithScope = {}
  ): Promise<PaginatedAttendance> {
    const params = new URLSearchParams();

    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.enrollmentId) params.append('enrollmentId', query.enrollmentId.toString());
    if (query.studentId) params.append('studentId', query.studentId.toString());
    if (query.sectionId) params.append('sectionId', query.sectionId.toString());
    if (query.courseId) params.append('courseId', query.courseId.toString());
    if (query.dateFrom) params.append('dateFrom', query.dateFrom);
    if (query.dateTo) params.append('dateTo', query.dateTo);
    if (query.statusCode) params.append('statusCode', query.statusCode);
    if (query.hasJustification !== undefined)
      params.append('hasJustification', query.hasJustification.toString());
    if (query.search) params.append('search', query.search);
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);

    // Parámetros de permisos (scope)
    if ('scope' in query && query.scope) params.append('scope', query.scope);
    if ('gradeId' in query && query.gradeId) params.append('gradeId', query.gradeId.toString());
    if ('sectionIdScope' in query && query.sectionIdScope)
      params.append('sectionIdScope', query.sectionIdScope.toString());

    const response = await api.get(`/api/attendance?${params.toString()}`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener asistencias');
    }

    const data = Array.isArray(response.data.data) ? response.data.data : [];
    const meta = response.data.meta || {
      page: query.page || 1,
      limit: query.limit || 10,
      total: 0,
      totalPages: 0,
    };

    return {
      data,
      meta,
      stats: response.data.stats,
    };
  },

  /**
   * Obtener asistencia por ID
   */
  async getAttendanceById(id: number): Promise<StudentAttendanceWithRelations> {
    const response = await api.get(`/api/attendance/${id}`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener la asistencia');
    }

    if (!response.data.data) {
      throw new Error('Asistencia no encontrada');
    }

    return response.data.data;
  },

  /**
   * Obtener asistencias por estudiante
   */
  async getStudentAttendances(
    enrollmentId: number,
    query: Omit<AttendanceQuery, 'enrollmentId'> = {}
  ): Promise<PaginatedAttendance> {
    return this.getAttendances({ ...query, enrollmentId });
  },

  /**
   * Obtener asistencias por sección
   */
  async getSectionAttendances(
    sectionId: number,
    query: Omit<AttendanceQuery, 'sectionId'> = {}
  ): Promise<PaginatedAttendance> {
    return this.getAttendances({ ...query, sectionId });
  },

  /**
   * Obtener estadísticas de asistencia
   */
  async getAttendanceStats(query: AttendanceQuery = {}): Promise<AttendanceStats> {
    const response = await api.get(`/api/attendance/stats`, { params: query });

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener estadísticas');
    }

    return response.data.data;
  },

  /**
   * Crear asistencia
   */
  async createAttendance(data: CreateAttendanceDto): Promise<StudentAttendance> {
    console.log('[AttendanceService] Creando asistencia:', data);
    const response = await api.post('/api/attendance', data);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al crear la asistencia');
    }

    console.log('[AttendanceService] Asistencia creada exitosamente:', response.data.data);
    return response.data.data;
  },

  /**
   * Crear o actualizar asistencia (UPSERT)
   * Si ya existe para ese estudiante en esa fecha, actualiza
   * Si no existe, crea
   * 
   * @param data - Datos de asistencia
   * @param allowUpdate - Si false, solo crea (rechaza si existe). Default: true
   */
  async upsertAttendance(data: CreateAttendanceDto, allowUpdate: boolean = true): Promise<StudentAttendance> {
    console.log('[AttendanceService] Upsertando asistencia:', { data, allowUpdate });
    const response = await api.post(`/api/attendance/upsert?allowUpdate=${allowUpdate}`, data);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al registrar la asistencia');
    }

    console.log('[AttendanceService] Asistencia guardada exitosamente:', response.data.data);
    return response.data.data;
  },

  /**
   * Actualizar asistencia - con fallback a crear si no existe
   */
  async updateAttendance(id: number, data: UpdateAttendanceDto): Promise<StudentAttendance> {
    console.log(`[AttendanceService] Intentando actualizar asistencia ID ${id}:`, data);
    try {
      const response = await api.patch(`/api/attendance/${id}`, data);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al actualizar la asistencia');
      }

      console.log('[AttendanceService] Asistencia actualizada exitosamente:', response.data.data);
      return response.data.data;
    } catch (error) {
      // Si falla porque no existe el registro, intentar crear con el id como enrollmentId
      const errorMsg = (error as any).response?.data?.message || (error as Error).message;
      
      if (errorMsg?.includes('No se encontró') || (error as any).response?.status === 404) {
        console.log(
          `[AttendanceService] Registro no encontrado (${errorMsg}). Intentando crear como nuevo registro con enrollmentId=${id}`
        );
        
        // Crear un nuevo registro usando el id como enrollmentId
        return this.createAttendance({
          enrollmentId: id,
          date: new Date().toISOString().split('T')[0],
          attendanceStatusId: data.attendanceStatusId || 1,
          ...data,
        } as CreateAttendanceDto);
      }
      
      throw error;
    }
  },

  /**
   * Crear o actualizar asistencia (upsert inteligente)
   * Si existe el registro por ID, lo actualiza
   * Si no existe y tenemos enrollmentId, crea uno nuevo
   */
  async smartUpdateAttendance(
    attendanceId: number | undefined,
    enrollmentId: number,
    attendanceStatusId: number,
    selectedDate: Date
  ): Promise<StudentAttendance> {
    const isoDate = selectedDate.toISOString().split('T')[0];
    
    // Si tenemos ID de asistencia, intentar actualizar
    if (attendanceId) {
      try {
        console.log(`[AttendanceService] Intentando actualizar asistencia ID: ${attendanceId}`);
        return await this.updateAttendance(attendanceId, { attendanceStatusId });
      } catch (error) {
        console.log(
          `[AttendanceService] Actualización falló (${(error as Error).message}), intentando crear nuevo registro`
        );
        // Continuar a crear
      }
    }

    // Si no hay ID o la actualización falló, crear nuevo
    console.log(
      `[AttendanceService] Creando nuevo registro de asistencia para enrollmentId: ${enrollmentId}`
    );
    return this.createAttendance({
      enrollmentId,
      date: isoDate,
      attendanceStatusId,
    });
  },

  /**
   * Eliminar asistencia
   */
  async deleteAttendance(id: number): Promise<void> {
    const response = await api.delete(`/api/attendance/${id}`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al eliminar la asistencia');
    }
  },

  /**
   * Crear múltiples asistencias
   */
  async bulkCreateAttendances(
    data: BulkCreateAttendanceDto
  ): Promise<BulkAttendanceResponse> {
    const response = await api.post('/api/attendance/bulk', data);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al crear asistencias');
    }

    return response.data.data;
  },

  /**
   * Actualizar múltiples asistencias
   */
  async bulkUpdateAttendances(
    data: BulkUpdateAttendanceDto
  ): Promise<BulkAttendanceResponse> {
    const response = await api.patch('/api/attendance/bulk', data);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al actualizar asistencias');
    }

    return response.data.data;
  },

  /**
   * Eliminar múltiples asistencias
   */
  async bulkDeleteAttendances(data: BulkDeleteAttendanceDto): Promise<BulkAttendanceResponse> {
    const response = await api.delete('/api/attendance/bulk', { data });

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al eliminar asistencias');
    }

    return response.data.data;
  },

  /**
   * Aplicar estado a múltiples estudiantes en una fecha
   */
  async bulkApplyStatus(data: BulkApplyStatusDto): Promise<BulkAttendanceResponse> {
    const response = await api.post('/api/attendance/bulk-apply-status', data);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al aplicar estado de asistencia');
    }

    return response.data.data;
  },

  /**
   * ✅ NUEVO: Aplicar asistencia a múltiples cursos simultáneamente
   * Registra asistencia para múltiples estudiantes en múltiples cursos
   */
  async bulkByCourses(data: BulkAttendanceByCourseDto): Promise<BulkAttendanceResponse> {
    const response = await api.post('/api/attendance/bulk-by-courses', data);

    if (!response.data?.success) {
      throw new Error(
        response.data?.message || 'Error al aplicar asistencia por cursos'
      );
    }

    return response.data.data;
  },

  /**
   * Obtener historial de cambios de asistencia
   */
  async getAttendanceChangeHistory(attendanceId: number) {
    const response = await api.get(`/api/attendance/${attendanceId}/changes`);

    if (!response.data?.success) {
      throw new Error(
        response.data?.message || 'Error al obtener historial de cambios'
      );
    }

    return response.data.data;
  },

  /**
   * Obtener justificantes de asistencia
   */
  async getJustifications(query: AttendanceQuery = {}): Promise<PaginatedAttendance> {
    const params = new URLSearchParams();

    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.enrollmentId) params.append('enrollmentId', query.enrollmentId.toString());
    if (query.search) params.append('search', query.search);

    const response = await api.get(`/api/attendance/justifications?${params.toString()}`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener justificantes');
    }

    const data = Array.isArray(response.data.data) ? response.data.data : [];
    const meta = response.data.meta || {
      page: query.page || 1,
      limit: query.limit || 10,
      total: 0,
      totalPages: 0,
    };

    return { data, meta };
  },

  /**
   * Obtener justificante por ID
   */
  async getJustificationById(id: number): Promise<StudentJustification> {
    const response = await api.get(`/api/attendance/justifications/${id}`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener el justificante');
    }

    return response.data.data;
  },

  /**
   * Crear justificante
   */
  async createJustification(data: CreateJustificationDto): Promise<StudentJustification> {
    const response = await api.post('/api/attendance/justifications', data);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al crear el justificante');
    }

    return response.data.data;
  },

  /**
   * Actualizar justificante
   */
  async updateJustification(
    id: number,
    data: UpdateJustificationDto
  ): Promise<StudentJustification> {
    const response = await api.patch(`/api/attendance/justifications/${id}`, data);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al actualizar el justificante');
    }

    return response.data.data;
  },

  /**
   * Aprobar justificante
   */
  async approveJustification(id: number, approvedBy: number): Promise<StudentJustification> {
    const response = await api.patch(`/api/attendance/justifications/${id}/approve`, {
      approvedBy,
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al aprobar el justificante');
    }

    return response.data.data;
  },

  /**
   * Rechazar justificante
   */
  async rejectJustification(
    id: number,
    rejectionReason: string
  ): Promise<StudentJustification> {
    const response = await api.patch(`/api/attendance/justifications/${id}/reject`, {
      rejectionReason,
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al rechazar el justificante');
    }

    return response.data.data;
  },

  /**
   * Eliminar justificante
   */
  async deleteJustification(id: number): Promise<void> {
    const response = await api.delete(`/api/attendance/justifications/${id}`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al eliminar el justificante');
    }
  },

  /**
   * Crear asistencia por clase
   */
  async createClassAttendance(data: CreateClassAttendanceDto): Promise<StudentClassAttendance> {
    const response = await api.post('/api/attendance/class-attendance', data);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al crear la asistencia de clase');
    }

    return response.data.data;
  },

  /**
   * Obtener asistencias por clase
   */
  async getClassAttendances(attendanceId: number): Promise<StudentClassAttendance[]> {
    const response = await api.get(`/api/attendance/${attendanceId}/class-attendances`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener asistencias de clase');
    }

    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  /**
   * Generar reporte de asistencia
   */
  async generateAttendanceReport(query: AttendanceQuery = {}): Promise<AttendanceReport[]> {
    const params = new URLSearchParams();

    if (query.enrollmentId) params.append('enrollmentId', query.enrollmentId.toString());
    if (query.sectionId) params.append('sectionId', query.sectionId.toString());
    if (query.dateFrom) params.append('dateFrom', query.dateFrom);
    if (query.dateTo) params.append('dateTo', query.dateTo);

    const response = await api.get(`/api/attendance/reports?${params.toString()}`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al generar reporte');
    }

    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  /**
   * Exportar asistencias a CSV
   */
  async exportAttendancesToCSV(query: AttendanceQuery = {}): Promise<Blob> {
    const params = new URLSearchParams();

    if (query.dateFrom) params.append('dateFrom', query.dateFrom);
    if (query.dateTo) params.append('dateTo', query.dateTo);
    if (query.sectionId) params.append('sectionId', query.sectionId.toString());

    const response = await api.get(`/api/attendance/export/csv?${params.toString()}`, {
      responseType: 'blob',
    });

    return response.data;
  },
};
