import { api } from '@/config/api';
import {
  EnrollmentResponse,
  EnrollmentDetailResponse,
  EnrollmentsQuery,
  PaginatedEnrollments,
  EnrollmentStatistics,
  CycleCapacity,
  CycleSummary,
  CreateEnrollmentDto,
  UpdateEnrollmentStatusDto,
  TransferEnrollmentDto,
  ApiResponse,
} from '@/types/enrollments.types';

export const enrollmentsService = {
  // ✅ LECTURA - CICLOS

  /**
   * Obtener ciclos disponibles para matrículas
   * GET /api/enrollments/cycles/available
   * 
   * Condiciones:
   * - canEnroll: true (acepta matrículas)
   * - isArchived: false (no está archivado)
   */
  async getAvailableCycles(): Promise<CycleSummary[]> {
    try {
      const response = await api.get<ApiResponse<CycleSummary[]>>(
        '/api/enrollments/cycles/available'
      );

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al obtener ciclos');
      }

      return response.data.data || [];
    } catch (error) {
      console.error('Error al obtener ciclos disponibles:', error);
      return [];
    }
  },

  // ✅ LECTURA - MATRÍCULAS

  /**
   * Listar matrículas con filtros
   */
  async getEnrollments(query: EnrollmentsQuery = {}): Promise<PaginatedEnrollments> {
    const params = new URLSearchParams();

    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.cycleId) params.append('cycleId', query.cycleId.toString());
    if (query.gradeId) params.append('gradeId', query.gradeId.toString());
    if (query.sectionId) params.append('sectionId', query.sectionId.toString());
    if (query.status) params.append('status', query.status);
    if (query.search) params.append('search', query.search);
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);

    const response = await api.get<ApiResponse<EnrollmentResponse[]>>(
      `/api/enrollments?${params.toString()}`
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener matrículas');
    }

    // Mapear respuesta del backend a PaginatedEnrollments
    return {
      data: response.data.data || [],
      meta: response.data.meta || {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    };
  },

  /**
   * Obtener detalle de una matrícula
   */
  async getEnrollmentDetail(enrollmentId: number): Promise<EnrollmentDetailResponse> {
    const response = await api.get<ApiResponse<EnrollmentDetailResponse>>(
      `/api/enrollments/${enrollmentId}`
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener matrícula');
    }

    if (!response.data.data) {
      throw new Error('Matrícula no encontrada');
    }

    return response.data.data;
  },

  /**
   * Obtener estadísticas de matrículas
   */
  async getStatistics(cycleId?: number): Promise<EnrollmentStatistics> {
    try {
      const params = cycleId ? `?cycleId=${cycleId}` : '';

      const response = await api.get<ApiResponse<EnrollmentStatistics>>(
        `/api/enrollments/statistics${params}`
      );

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al obtener estadísticas');
      }

      return response.data.data as EnrollmentStatistics;
    } catch (error: any) {
      // Fallback: calcular estadísticas a partir de enrollments
      console.warn('Estadísticas endpoint no disponible, calculando desde enrollments...');
      
      try {
        const enrollmentsResponse = await this.getEnrollments({ 
          limit: 1000,
          cycleId 
        });

        const enrollments = enrollmentsResponse.data;

        // Calcular por estado
        const byStatus: Record<string, number> = {
          ACTIVE: 0,
          INACTIVE: 0,
          GRADUATED: 0,
          TRANSFERRED: 0,
        };

        enrollments.forEach((e) => {
          byStatus[e.status] = (byStatus[e.status] || 0) + 1;
        });

        // Calcular por grado
        const gradeMap = new Map<string, { gradeName: string; count: number }>();
        enrollments.forEach((e) => {
          const key = `${e.grade.id}`;
          if (!gradeMap.has(key)) {
            gradeMap.set(key, { gradeName: e.grade.name, count: 0 });
          }
          const grade = gradeMap.get(key)!;
          grade.count += 1;
        });

        const byGrade = Array.from(gradeMap.values()).map((g, idx) => ({
          gradeId: idx + 1,
          gradeName: g.gradeName,
          count: g.count,
        }));

        // Calcular ocupación por sección
        const sectionMap = new Map<string, { sectionName: string; capacity: number; enrolled: number }>();
        enrollments.forEach((e) => {
          const key = `${e.section.id}`;
          if (!sectionMap.has(key)) {
            sectionMap.set(key, { 
              sectionName: e.section.name, 
              capacity: e.section.capacity,
              enrolled: 0 
            });
          }
          const section = sectionMap.get(key)!;
          section.enrolled += 1;
        });

        const sectionOccupancy = Array.from(sectionMap.entries()).map(([id, s]) => ({
          sectionId: parseInt(id),
          sectionName: s.sectionName,
          capacity: s.capacity,
          enrolled: s.enrolled,
          percentage: (s.enrolled / s.capacity) * 100,
        }));

        return {
          total: enrollments.length,
          byStatus,
          byGrade,
          sectionOccupancy,
        };
      } catch (fallbackError) {
        throw new Error('Error al cargar estadísticas y calcular fallback');
      }
    }
  },

  /**
   * Obtener capacidad de ciclo
   */
  async getCycleCapacity(cycleId: number): Promise<CycleCapacity> {
    const response = await api.get<ApiResponse<CycleCapacity>>(
      `/api/enrollments/cycles/${cycleId}/capacity`
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener capacidad');
    }

    return response.data.data as CycleCapacity;
  },

  /**
   * Exportar matrículas a Excel
   */
  async exportToExcel(query: EnrollmentsQuery = {}): Promise<Blob> {
    const params = new URLSearchParams();

    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.cycleId) params.append('cycleId', query.cycleId.toString());
    if (query.gradeId) params.append('gradeId', query.gradeId.toString());
    if (query.sectionId) params.append('sectionId', query.sectionId.toString());
    if (query.status) params.append('status', query.status);
    if (query.search) params.append('search', query.search);

    const response = await api.get(
      `/api/enrollments/export?${params.toString()}`,
      { responseType: 'blob' }
    );

    return response.data as Blob;
  },

  // ✅ CREAR

  /**
   * Crear nueva matrícula
   */
  async createEnrollment(data: CreateEnrollmentDto): Promise<EnrollmentResponse> {
    const response = await api.post<ApiResponse<EnrollmentResponse>>(
      '/api/enrollments',
      data
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al crear matrícula');
    }

    return response.data.data as EnrollmentResponse;
  },

  // ✅ ACTUALIZAR

  /**
   * Cambiar estado de matrícula
   */
  async updateEnrollmentStatus(
    enrollmentId: number,
    data: UpdateEnrollmentStatusDto
  ): Promise<EnrollmentResponse> {
    const response = await api.patch<ApiResponse<EnrollmentResponse>>(
      `/api/enrollments/${enrollmentId}/status`,
      data
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al cambiar estado');
    }

    return response.data.data as EnrollmentResponse;
  },

  /**
   * Transferir estudiante
   */
  async transferStudent(
    enrollmentId: number,
    data: TransferEnrollmentDto
  ): Promise<EnrollmentDetailResponse> {
    const response = await api.post<ApiResponse<EnrollmentDetailResponse>>(
      `/api/enrollments/${enrollmentId}/transfer`,
      data
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error en transferencia');
    }

    return response.data.data as EnrollmentDetailResponse;
  },

  // ✅ ELIMINAR

  /**
   * Eliminar matrícula
   */
  async deleteEnrollment(enrollmentId: number): Promise<void> {
    const response = await api.delete(`/api/enrollments/${enrollmentId}`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al eliminar matrícula');
    }
  },
};
