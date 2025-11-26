// src/services/course-grades.service.ts
import { api } from '@/config/api';
import {
  CourseGrade,
  CourseGradeDetail,
  CourseGradesQuery,
  PaginatedCourseGrades,
  CourseGradeStats,
  CreateCourseGradeDto,
  UpdateCourseGradeDto,
  AvailableCourse,
  AvailableGrade,
  AvailableDataResponse,
} from '@/types/course-grades.types';

export const courseGradesService = {
  /**
   * Obtener grados disponibles
   */
  async getAvailableGrades(): Promise<AvailableGrade[]> {
    const response = await api.get('/api/course-grades/available/grades');
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener grados disponibles');
    }

    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  /**
   * Obtener cursos disponibles
   */
  async getAvailableCourses(): Promise<AvailableCourse[]> {
    const response = await api.get('/api/course-grades/available/courses');
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener cursos disponibles');
    }

    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  /**
   * Obtener asignaciones paginadas con filtros
   */
  async getCourseGrades(query: CourseGradesQuery = {}): Promise<PaginatedCourseGrades> {
    const params = new URLSearchParams();
    
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.courseId) params.append('courseId', query.courseId.toString());
    if (query.gradeId) params.append('gradeId', query.gradeId.toString());
    if (query.isCore !== undefined) params.append('isCore', query.isCore.toString());
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);

    const response = await api.get(`/api/course-grades?${params.toString()}`);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener asignaciones');
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
   * Obtener asignación por ID
   */
  async getCourseGradeById(id: number): Promise<CourseGradeDetail> {
    const response = await api.get(`/api/course-grades/${id}`);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener la asignación');
    }

    if (!response.data.data) {
      throw new Error('Asignación no encontrada');
    }

    return response.data.data;
  },

  /**
   * Obtener grados de un curso
   */
  async getGradesByCourse(courseId: number): Promise<CourseGradeDetail[]> {
    const response = await api.get(`/api/course-grades/course/${courseId}/grades`);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener grados del curso');
    }

    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  /**
   * Obtener cursos de un grado
   */
  async getCoursesByGrade(gradeId: number): Promise<CourseGradeDetail[]> {
    const response = await api.get(`/api/course-grades/grade/${gradeId}/courses`);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener cursos del grado');
    }

    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  /**
   * Obtener estadísticas de un curso
   */
  async getCourseStats(courseId: number): Promise<CourseGradeStats> {
    const response = await api.get(`/api/course-grades/${courseId}/stats`);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener estadísticas');
    }

    return response.data.data;
  },

  /**
   * Crear asignación
   */
  async createCourseGrade(data: CreateCourseGradeDto): Promise<CourseGradeDetail> {
    const response = await api.post('/api/course-grades', data);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al crear la asignación');
    }

    return response.data.data;
  },

  /**
   * Actualizar asignación
   */
  async updateCourseGrade(id: number, data: UpdateCourseGradeDto): Promise<CourseGradeDetail> {
    const response = await api.patch(`/api/course-grades/${id}`, data);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al actualizar la asignación');
    }

    return response.data.data;
  },

  /**
   * Eliminar asignación
   */
  async deleteCourseGrade(id: number): Promise<void> {
    const response = await api.delete(`/api/course-grades/${id}`);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al eliminar la asignación');
    }
  },
};
