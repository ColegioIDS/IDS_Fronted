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
          SUSPENDED: 0,
          INACTIVE: 0,
          TRANSFERRED: 0,
        };

        enrollments.forEach((e) => {
          byStatus[e.status] = (byStatus[e.status] || 0) + 1;
        });

        // Calcular por grado
        const gradeMap = new Map<number, { gradeName: string; count: number }>();
        enrollments.forEach((e) => {
          const key = e.grade.id;
          if (!gradeMap.has(key)) {
            gradeMap.set(key, { gradeName: e.grade.name, count: 0 });
          }
          const grade = gradeMap.get(key)!;
          grade.count += 1;
        });

        const byGrade = Array.from(gradeMap.entries()).map(([gradeId, g]) => ({
          gradeId,
          gradeName: g.gradeName,
          count: g.count,
        }));

        // Calcular por ciclo
        const cycleMap = new Map<string, number>();
        enrollments.forEach((e) => {
          const cycleName = e.cycle?.name || 'Ciclo Desconocido';
          cycleMap.set(cycleName, (cycleMap.get(cycleName) || 0) + 1);
        });

        const byCycle = Object.fromEntries(cycleMap);

        // Calcular ocupación por sección
        const sectionMap = new Map<number, { sectionName: string; capacity: number; count: number }>();
        enrollments.forEach((e) => {
          const key = e.section.id;
          if (!sectionMap.has(key)) {
            sectionMap.set(key, { 
              sectionName: e.section.name, 
              capacity: e.section.capacity || 30,
              count: 0 
            });
          }
          const section = sectionMap.get(key)!;
          section.count += 1;
        });

        const bySection = Array.from(sectionMap.entries()).map(([sectionId, s]) => ({
          sectionId,
          sectionName: s.sectionName,
          capacity: s.capacity,
          count: s.count,
        }));

        // Calcular utilización general
        const totalCapacity = bySection.reduce((sum, s) => sum + s.capacity, 0);
        const utilizationPercentage = totalCapacity > 0 ? (enrollments.length / totalCapacity) * 100 : 0;

        return {
          total: enrollments.length,
          byStatus,
          byCycle,
          byGrade,
          bySection,
          utilizationPercentage,
        };
      } catch (fallbackError) {
        console.error('Error en fallback de estadísticas:', fallbackError);
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

  // ✅ LECTURA - GRADOS Y SECCIONES

  /**
   * Obtener grados disponibles para un ciclo específico
   * GET /api/enrollments/grades?cycleId={cycleId}
   * 
   * Retorna estructura completa de grado + ciclo
   */
  async getGrades(cycleId?: number): Promise<Array<{ 
    id: number; 
    name: string;
    level?: string;
    cycleId?: number;
    cycleName?: string;
  }>> {
    try {
      const params = cycleId ? `?cycleId=${cycleId}` : '';
      const response = await api.get<ApiResponse<Array<{ 
        id: number; 
        name: string;
        level?: string;
        cycleId?: number;
        cycleName?: string;
      }>>>(
        `/api/enrollments/grades${params}`
      );

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al obtener grados');
      }

      return response.data.data || [];
    } catch (error: any) {
      console.error('Error al obtener grados:', error);
      return [];
    }
  },

  /**
   * Obtener secciones disponibles para un ciclo específico
   * GET /api/enrollments/sections?cycleId={cycleId}&gradeId={gradeId}
   * 
   * Retorna estructura completa de sección + grado + ciclo
   * Si se proporciona gradeId, filtra solo las secciones de ese grado
   */
  async getSections(cycleId?: number, gradeId?: number): Promise<Array<{ 
    id: number; 
    name: string;
    capacity: number;
    gradeId?: number;
    gradeName?: string;
    cycleId?: number;
    cycleName?: string;
  }>> {
    try {
      const params = new URLSearchParams();
      if (cycleId) params.append('cycleId', cycleId.toString());
      if (gradeId) params.append('gradeId', gradeId.toString());
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      
      const response = await api.get<ApiResponse<Array<{ 
        id: number; 
        name: string;
        capacity: number;
        gradeId?: number;
        gradeName?: string;
        cycleId?: number;
        cycleName?: string;
      }>>>(
        `/api/enrollments/sections${queryString}`
      );

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al obtener secciones');
      }

      return response.data.data || [];
    } catch (error: any) {
      console.error('Error al obtener secciones:', error);
      return [];
    }
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
