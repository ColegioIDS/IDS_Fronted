// src/services/courses.service.ts
import { api } from '@/config/api';
import {
  Course,
  CourseWithRelations,
  CourseFilters,
  PaginatedCourses,
  CreateCourseDto,
  UpdateCourseDto,
} from '@/types/courses';

export const coursesService = {
  /**
   * Obtener cursos paginados con filtros
   */
  async getCourses(query: CourseFilters & { page?: number; limit?: number } = {}): Promise<PaginatedCourses> {
    const params = new URLSearchParams();

    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.searchQuery) params.append('search', query.searchQuery);
    if (query.isActive !== undefined) params.append('isActive', query.isActive.toString());
    if (query.area) params.append('area', query.area);
    if (query.gradeId) params.append('gradeId', query.gradeId.toString());

    const response = await api.get(`/api/courses?${params.toString()}`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener cursos');
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
   * Obtener curso por ID
   */
  async getCourseById(id: number): Promise<CourseWithRelations> {
    const response = await api.get(`/api/courses/${id}`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener el curso');
    }

    if (!response.data.data) {
      throw new Error('Curso no encontrado');
    }

    return response.data.data;
  },

  /**
   * Obtener curso por código
   */
  async getCourseByCode(code: string): Promise<CourseWithRelations> {
    const response = await api.get(`/api/courses/code/${code}`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener el curso');
    }

    if (!response.data.data) {
      throw new Error('Curso no encontrado');
    }

    return response.data.data;
  },

  /**
   * Crear curso
   */
  async createCourse(data: CreateCourseDto): Promise<Course> {
    const response = await api.post('/api/courses', data);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al crear el curso');
    }

    return response.data.data;
  },

  /**
   * Actualizar curso
   */
  async updateCourse(id: number, data: UpdateCourseDto): Promise<Course> {
    const response = await api.patch(`/api/courses/${id}`, data);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al actualizar el curso');
    }

    return response.data.data;
  },

  /**
   * Eliminar curso (soft delete)
   */
  async deleteCourse(id: number): Promise<void> {
    const response = await api.delete(`/api/courses/${id}`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al eliminar el curso');
    }
  },

  /**
   * Restaurar curso eliminado
   */
  async restoreCourse(id: number): Promise<Course> {
    const response = await api.patch(`/api/courses/${id}/restore`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al restaurar el curso');
    }

    return response.data.data;
  },

  /**
   * Obtener estadísticas del curso
   */
  async getCourseStats(id: number) {
    const response = await api.get(`/api/courses/${id}/stats`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener estadísticas');
    }

    return response.data.data;
  },
};
