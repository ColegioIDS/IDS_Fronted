// src/services/courseGrades.service.ts
import { api } from '@/config/api';
import {
  CourseGrade,
  CourseGradeWithRelations,
  CourseGradeFilters,
  PaginatedCourseGrades,
  CreateCourseGradeDto,
  UpdateCourseGradeDto,
  Grade,
  CourseForGrade,
} from '@/types/courseGrades';

export const courseGradesService = {
  /**
   * Obtener todas las relaciones paginadas
   */
  async getCourseGrades(
    query: CourseGradeFilters & { page?: number; limit?: number } = {}
  ): Promise<PaginatedCourseGrades> {
    const params = new URLSearchParams();

    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.courseId) params.append('courseId', query.courseId.toString());
    if (query.gradeId) params.append('gradeId', query.gradeId.toString());
    if (query.isCore !== undefined) params.append('isCore', query.isCore.toString());
    if (query.searchQuery) params.append('search', query.searchQuery);

    const response = await api.get(`/api/course-grades?${params.toString()}`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener relaciones');
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
   * Obtener una relación por ID
   */
  async getCourseGradeById(id: number): Promise<CourseGradeWithRelations> {
    const response = await api.get(`/api/course-grades/${id}`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener la relación');
    }

    return response.data.data;
  },

  /**
   * Obtener grados disponibles
   */
  async getAvailableGrades(): Promise<Grade[]> {
    const response = await api.get('/api/course-grades/available/grades');

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener grados');
    }

    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  /**
   * Obtener cursos disponibles
   */
  async getAvailableCourses(): Promise<CourseForGrade[]> {
    const response = await api.get('/api/course-grades/available/courses');

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener cursos');
    }

    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  /**
   * Obtener cursos por grado
   */
  async getCoursesByGrade(gradeId: number): Promise<CourseForGrade[]> {
    const response = await api.get(`/api/course-grades/grade/${gradeId}/courses`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener cursos del grado');
    }

    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  /**
   * Obtener grados por curso
   */
  async getGradesByCourse(courseId: number): Promise<Grade[]> {
    const response = await api.get(`/api/course-grades/course/${courseId}/grades`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener grados del curso');
    }

    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  /**
   * Crear nueva relación
   */
  async createCourseGrade(data: CreateCourseGradeDto): Promise<CourseGradeWithRelations> {
    const response = await api.post('/api/course-grades', data);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al crear la relación');
    }

    return response.data.data;
  },

  /**
   * Actualizar relación
   */
  async updateCourseGrade(
    id: number,
    data: UpdateCourseGradeDto
  ): Promise<CourseGradeWithRelations> {
    const response = await api.patch(`/api/course-grades/${id}`, data);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al actualizar la relación');
    }

    return response.data.data;
  },

  /**
   * Eliminar relación
   */
  async deleteCourseGrade(id: number): Promise<void> {
    const response = await api.delete(`/api/course-grades/${id}`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al eliminar la relación');
    }
  },
};
