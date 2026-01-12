// src/services/students.service.ts
import { api } from '@/config/api';
import {
  Student,
  CreateStudentPayload,
  EnrollmentFormData,
  GradeWithSections,
  SectionsAvailability,
  ParentDpiResponse,
  StudentTransferPayload,
  EnrollmentStatus,
} from '@/types/students.types';

// ✅ Query params para listar estudiantes
export interface StudentsQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'givenNames' | 'lastNames' | 'codeSIRE' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  gradeId?: number;
}

// ✅ Response paginada para estudiantes
export interface PaginatedStudents {
  data: Student[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const studentsService = {
  /**
   * Obtener datos de formulario de crear estudiante (ciclo y grados)
   * Scopes: ALL, GRADE, SECTION
   */
  async getEnrollmentFormData(): Promise<EnrollmentFormData> {
    const response = await api.get('/api/students/enrollment-form-data');

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener datos de formulario');
    }

    // ✅ ACTUALIZADO: Ahora manejamos array de ciclos
    const data = response.data.data;
    
    // Si viene un array de ciclos directamente, lo procesamos
    if (Array.isArray(data)) {
      const cycles = data.map(cycle => ({
        id: cycle.id,
        name: cycle.name,
        description: cycle.description,
        academicYear: cycle.academicYear,
        startDate: cycle.startDate,
        endDate: cycle.endDate,
        isActive: cycle.isActive,
        canEnroll: cycle.canEnroll,
        isArchived: cycle.isArchived,
        grades: cycle.grades || []
      }));
      
      // Obtener el ciclo activo (si existe)
      const activeCycle = cycles.find(c => c.isActive) || cycles[0];
      
      
      return {
        cycles,
        activeCycle
      };
    }
    
    // Si viene un objeto con cycles
    if (data.cycles) {
      return data;
    }
    
    // Fallback: si viene un object directo con activeCycle
    return data;
  },

  /**
   * Obtener grados disponibles para un ciclo
   * Scopes: ALL, GRADE, SECTION
   */
  async getGradesByCycle(cycleId: number): Promise<GradeWithSections> {
    const response = await api.get(`/api/students/cycles/${cycleId}/grades`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener grados');
    }

    return response.data.data;
  },

  /**
   * Obtener secciones disponibles para un grado
   * Scopes: ALL, GRADE, SECTION
   */
  async getSectionsByGrade(
    cycleId: number,
    gradeId: number
  ): Promise<SectionsAvailability> {
    const response = await api.get(
      `/api/students/cycles/${cycleId}/grades/${gradeId}/sections`
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener secciones');
    }

    return response.data.data;
  },

  /**
   * Validar disponibilidad de DPI antes de crear padre
   * Scopes: ALL, GRADE, SECTION
   */
  async validateParentDPI(dpi: string): Promise<ParentDpiResponse> {
    const response = await api.get(`/api/students/users/validate-dpi/${dpi}`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al validar DPI');
    }

    return response.data.data;
  },

  /**
   * Crear estudiante + matrícula en una sola llamada
   * Scopes: ALL
   * ⭐ ENDPOINT UNIFICADO
   */
  async createStudentWithEnrollment(data: CreateStudentPayload): Promise<Student> {
    // ✅ ACTUALIZADO: Enviar como JSON en lugar de FormData

    const response = await api.post('/api/students/complete', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al crear estudiante');
    }

    return response.data.data;
  },

  /**
   * Obtener estudiantes paginados con filtros
   * Scopes: ALL, GRADE, SECTION
   */
  async getStudents(query: StudentsQuery = {}): Promise<PaginatedStudents> {
    const params = new URLSearchParams();

    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);
    if (query.gradeId) params.append('gradeId', query.gradeId.toString());

    const response = await api.get(`/api/students?${params.toString()}`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener estudiantes');
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
   * Obtener estudiante por ID con relaciones completas
   * Scopes: ALL, GRADE, SECTION
   */
  async getStudentById(id: number): Promise<Student> {
    const response = await api.get(`/api/students/${id}`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener estudiante');
    }

    if (!response.data.data) {
      throw new Error('Estudiante no encontrado');
    }

    return response.data.data;
  },

  /**
   * Actualizar estudiante
   * Scopes: ALL, GRADE, SECTION
   */
  async updateStudent(
    id: number,
    data: Partial<CreateStudentPayload>
  ): Promise<Student> {

    const response = await api.patch(`/api/students/${id}`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al actualizar estudiante');
    }

    return response.data.data;
  },

  /**
   * Cambiar estado de matrícula (transferencia de sección/grado)
   * Scopes: ALL, GRADE
   */
  async transferStudent(
    id: number,
    data: StudentTransferPayload
  ): Promise<Student> {
    const response = await api.patch(`/api/students/${id}/transfer`, data);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al transferir estudiante');
    }

    return response.data.data;
  },

  /**
   * Cambiar estado de matrícula (activo, inactivo, graduado)
   * Scopes: ALL
   */
  async updateEnrollmentStatus(
    id: number,
    newStatus: EnrollmentStatus
  ): Promise<Student> {
    const response = await api.patch(`/api/students/${id}/enrollment-status`, {
      status: newStatus,
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al cambiar estado de matrícula');
    }

    return response.data.data;
  },

  /**
   * Eliminar estudiante (soft delete)
   * Scopes: ALL
   */
  async deleteStudent(id: number): Promise<void> {
    const response = await api.delete(`/api/students/${id}`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al eliminar estudiante');
    }
  },

  /**
   * Restaurar estudiante eliminado
   * Scopes: ALL
   */
  async restoreStudent(id: number): Promise<Student> {
    const response = await api.patch(`/api/students/${id}/restore`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al restaurar estudiante');
    }

    return response.data.data;
  },

  /**
   * Subir foto de perfil
   * Scopes: ALL, GRADE, SECTION
   */
  async uploadProfileImage(studentId: number, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post(`/api/students/${studentId}/picture`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al subir foto');
    }

    return response.data.data.url;
  },

  /**
   * Obtener foto de perfil
   * Scopes: ALL, GRADE, SECTION
   */
  async getProfileImage(studentId: number): Promise<string> {
    const response = await api.get(`/api/students/${studentId}/picture`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener foto');
    }

    return response.data.data.url;
  },

  /**
   * Eliminar foto de perfil
   * Scopes: ALL, GRADE, SECTION
   */
  async deleteProfileImage(studentId: number): Promise<void> {
    const response = await api.delete(`/api/students/${studentId}/picture`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al eliminar foto');
    }
  },

  /**
   * Obtener estadísticas de estudiante
   * Scopes: ALL, GRADE, SECTION
   */
  async getStudentStats(id: number): Promise<{
    id: number;
    fullName: string;
    codeSIRE: string;
    age: number;
    enrollmentsCount: number;
    parentsCount: number;
    picturesCount: number;
    hasCompleteProfile: boolean;
  }> {
    const response = await api.get(`/api/students/${id}/stats`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener estadísticas');
    }

    return response.data.data;
  },

  /**
   * Exportar estudiantes (PDF, Excel)
   * Scopes: ALL, GRADE
   */
  async exportStudents(format: 'pdf' | 'excel', query?: StudentsQuery): Promise<Blob> {
    const params = new URLSearchParams();

    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.search) params.append('search', query.search);

    const response = await api.get(`/api/students/export/${format}?${params.toString()}`, {
      responseType: 'blob',
    });

    return response.data;
  },

  /**
   * Obtener departamentos con sus municipios asociados
   * GET /api/students/locations/departments-municipalities
   * Usado para llenar dropdowns en formularios de dirección
   * Scopes: ALL, GRADE, SECTION
   */
  async getDepartmentsWithMunicipalities(): Promise<Array<{
    id: number;
    name: string;
    code: string;
    municipalities: Array<{
      id: number;
      name: string;
      code: string;
    }>;
  }>> {
    const response = await api.get('/api/students/locations/departments-municipalities');

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener departamentos y municipios');
    }

    return response.data.data || [];
  },
};
