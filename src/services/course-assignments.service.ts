// src/services/course-assignments.service.ts
import { api } from '@/config/api';
import {
  CourseAssignment,
  CourseAssignmentFilters,
  PaginatedCourseAssignments,
  CourseAssignmentFormData,
  CycleGradesData,
  SectionAssignmentData,
  CreateCourseAssignmentDto,
  UpdateCourseAssignmentDto,
  BulkCreateCourseAssignmentDto,
  BulkOperationResponse,
  CourseAssignmentStats,
  TeacherCourse,
  DeleteCourseAssignmentResponse,
  AssignmentType,
} from '@/types/course-assignments.types';

export const courseAssignmentsService = {
  /**
   * Obtener lista de ciclos escolares disponibles
   */
  async getFormData(): Promise<CourseAssignmentFormData> {
    const response = await api.get('/api/course-assignments/form-data');
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener datos del formulario');
    }

    if (!response.data.data) {
      throw new Error('Datos del formulario no encontrados');
    }

    return response.data.data;
  },

  /**
   * Obtener grados y secciones de un ciclo específico
   */
  async getCycleGrades(cycleId: number): Promise<CycleGradesData> {
    const response = await api.get(`/api/course-assignments/cycle/${cycleId}/grades`);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener grados del ciclo');
    }

    if (!response.data.data) {
      throw new Error('Datos del ciclo no encontrados');
    }

    return response.data.data;
  },

  /**
   * Obtener todas las asignaciones con paginación y filtros
   */
  async getCourseAssignments(
    query: CourseAssignmentFilters = {}
  ): Promise<PaginatedCourseAssignments> {
    const params = new URLSearchParams();
    
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);
    if (query.sectionId) params.append('sectionId', query.sectionId.toString());
    if (query.courseId) params.append('courseId', query.courseId.toString());
    if (query.teacherId) params.append('teacherId', query.teacherId.toString());
    if (query.gradeId) params.append('gradeId', query.gradeId.toString());
    if (query.assignmentType) params.append('assignmentType', query.assignmentType);
    if (query.isActive !== undefined) params.append('isActive', query.isActive.toString());
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);

    const response = await api.get(`/api/course-assignments?${params.toString()}`);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener asignaciones');
    }

    const data = Array.isArray(response.data.data) ? response.data.data : [];
    const meta = response.data.meta || {
      page: query.page || 1,
      limit: query.limit || 10,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
    };

    return { data, meta };
  },

  /**
   * Obtener una asignación por ID
   */
  async getCourseAssignmentById(id: number): Promise<CourseAssignment> {
    const response = await api.get(`/api/course-assignments/${id}`);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener la asignación');
    }

    if (!response.data.data) {
      throw new Error('Asignación no encontrada');
    }

    return response.data.data;
  },

  /**
   * Obtener datos de asignaciones de una sección específica
   */
  async getSectionAssignmentData(sectionId: number): Promise<SectionAssignmentData> {
    const response = await api.get(`/api/course-assignments/section/${sectionId}/data`);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener datos de la sección');
    }

    if (!response.data.data) {
      throw new Error('Datos de la sección no encontrados');
    }

    const data = response.data.data;
    
    // Normalizar la respuesta: el backend puede enviar 'courses' o 'availableCourses'
    // y 'teachers' o 'availableTeachers'
    return {
      section: data.section,
      assignments: data.assignments || [],
      availableCourses: data.availableCourses || data.courses || [],
      availableTeachers: data.availableTeachers || data.teachers || [],
      totalAssignments: data.totalAssignments || (data.assignments?.length || 0),
    };
  },

  /**
   * Obtener asignaciones activas de una sección
   */
  async getSectionAssignments(sectionId: number): Promise<CourseAssignment[]> {
    const response = await api.get(`/api/course-assignments/section/${sectionId}`);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener asignaciones de la sección');
    }

    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  /**
   * Obtener asignaciones activas de un grado
   */
  async getGradeAssignments(gradeId: number): Promise<CourseAssignment[]> {
    const response = await api.get(`/api/course-assignments/grade/${gradeId}`);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener asignaciones del grado');
    }

    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  /**
   * Obtener cursos asignados a un profesor
   */
  async getTeacherCourses(teacherId: number): Promise<TeacherCourse[]> {
    const response = await api.get(`/api/course-assignments/teacher/${teacherId}/courses`);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener cursos del profesor');
    }

    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  /**
   * Obtener estadísticas de asignaciones
   */
  async getStats(): Promise<CourseAssignmentStats> {
    const response = await api.get('/api/course-assignments/stats');
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener estadísticas');
    }

    if (!response.data.data) {
      throw new Error('Estadísticas no encontradas');
    }

    return response.data.data;
  },

  /**
   * Crear una nueva asignación
   */
  async createCourseAssignment(data: CreateCourseAssignmentDto): Promise<CourseAssignment> {
    const response = await api.post('/api/course-assignments', data);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al crear la asignación');
    }

    if (!response.data.data) {
      throw new Error('No se pudo crear la asignación');
    }

    return response.data.data;
  },

  /**
   * Actualizar una asignación existente
   */
  async updateCourseAssignment(
    id: number,
    data: UpdateCourseAssignmentDto
  ): Promise<CourseAssignment> {
    const response = await api.patch(`/api/course-assignments/${id}`, data);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al actualizar la asignación');
    }

    if (!response.data.data) {
      throw new Error('No se pudo actualizar la asignación');
    }

    return response.data.data;
  },

  /**
   * Eliminar una asignación (soft o hard delete)
   */
  async deleteCourseAssignment(id: number): Promise<DeleteCourseAssignmentResponse> {
    const response = await api.delete(`/api/course-assignments/${id}`);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al eliminar la asignación');
    }

    return response.data.data || { message: 'Asignación eliminada', deleted: true };
  },

  /**
   * Crear múltiples asignaciones
   */
  async bulkCreateCourseAssignments(
    data: BulkCreateCourseAssignmentDto
  ): Promise<BulkOperationResponse<CourseAssignment>> {
    const response = await api.post('/api/course-assignments/bulk', data);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al crear asignaciones masivas');
    }

    return response.data.data || { created: [], failed: [] };
  },

  /**
   * Actualizar múltiples asignaciones
   * Envía las asignaciones con la estructura requerida por el backend
   */
  async bulkUpdateCourseAssignments(data: {
    sectionId: number;
    assignments: Array<{
      courseId: number;
      teacherId: number;
      assignmentType?: AssignmentType;
      notes?: string;
    }>;
  }): Promise<BulkOperationResponse<CourseAssignment>> {
    const response = await api.patch('/api/course-assignments/bulk', data);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al actualizar asignaciones masivas');
    }

    return response.data.data || { updated: [], created: [], failed: [] };
  },
};
