/**
 * Servicio para el módulo de Assignments
 * Incluye:
 * - Gestión de tareas y entregas
 * - Datos en cascada
 * 
 * NOTA: Todas las fechas se procesan en la zona horaria de Guatemala (America/Guatemala)
 */

import { api } from '@/config/api';
import { formatDateForAPI, formatDateTimeForAPI } from '@/config/date-utils';
import {
  Assignment,
  AssignmentSubmission,
  BimesterOption,
  CourseOption,
  GradeOption,
  SectionOption,
  PaginatedResponse,
  AssignmentResponse,
  AssignmentSubmissionResponse,
  SubmissionsListResponse,
  StudentSubmissionsResponse,
} from '@/types/assignments.types';

// ==================== SERVICIO DE CASCADA ====================

export const assignmentsCascadeService = {
  /**
   * Obtiene todos los datos en cascada (grados, secciones, cursos, bimestres)
   * GET /api/assignments/cascade?includeInactive=true
   */
  async getCascadeData(includeInactive: boolean = true) {
    const response = await api.get('/api/assignments/cascade', {
      params: { includeInactive },
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener datos en cascada');
    }

    return response.data.data;
  },
};

// ==================== SERVICIO DE TAREAS ====================

export const assignmentsService = {
  /**
   * Crea una nueva tarea
   * POST /api/assignments
   * Las fechas se envían automáticamente en la zona horaria de Guatemala
   */
  async createAssignment(data: {
    title: string;
    description?: string;
    courseId: number;
    bimesterId: number;
    dueDate: string | Date;
    maxScore: number;
  }): Promise<AssignmentResponse> {
    // Convertir la fecha a string en formato YYYY-MM-DD si es un objeto Date
    const dueDateString = data.dueDate instanceof Date 
      ? formatDateForAPI(data.dueDate)
      : data.dueDate;

    const payload = {
      ...data,
      dueDate: dueDateString,
      // Agregar timestamp de creación en timezone configurado
      createdAt: formatDateTimeForAPI(),
    };

    console.log('🔵 [AssignmentsService] POST /api/assignments', payload);
    
    const response = await api.post('/api/assignments', payload);
    
    console.log('🟢 [AssignmentsService] Response Status:', response.status);
    console.log('🟢 [AssignmentsService] Response Data:', response.data);

    if (!response.data?.success) {
      const errorMsg = response.data?.message || `Error al crear la tarea (Status: ${response.status})`;
      console.error('🔴 [AssignmentsService] Error:', errorMsg);
      throw new Error(errorMsg);
    }

    return response.data.data;
  },

  /**
   * Obtiene la lista de tareas con filtros opcionales
   * GET /api/assignments?courseId=5&bimesterId=2&page=1&limit=10
   */
  async listAssignments(filters?: {
    courseId?: number;
    bimesterId?: number;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<AssignmentResponse>> {
    const response = await api.get('/api/assignments', { params: filters });

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener tareas');
    }

    return response.data.data;
  },

  /**
   * Obtiene los detalles de una tarea específica
   * GET /api/assignments/:id
   */
  async getAssignmentById(assignmentId: number): Promise<AssignmentResponse> {
    const response = await api.get(`/api/assignments/${assignmentId}`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener la tarea');
    }

    return response.data.data;
  },

  /**
   * Actualiza una tarea existente
   * PATCH /api/assignments/:id
   * Las fechas se envían automáticamente en la zona horaria de Guatemala
   */
  async updateAssignment(
    assignmentId: number,
    data: {
      title?: string;
      description?: string;
      dueDate?: string | Date;
      maxScore?: number;
    }
  ): Promise<AssignmentResponse> {
    // Convertir la fecha a string en formato YYYY-MM-DD si es un objeto Date
    const updateData = { ...data };
    if (data.dueDate instanceof Date) {
      updateData.dueDate = formatDateForAPI(data.dueDate);
    }

    const response = await api.patch(`/api/assignments/${assignmentId}`, updateData);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al actualizar la tarea');
    }

    return response.data.data;
  },

  /**
   * Elimina una tarea
   * DELETE /api/assignments/:id
   */
  async deleteAssignment(assignmentId: number): Promise<void> {
    const response = await api.delete(`/api/assignments/${assignmentId}`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al eliminar la tarea');
    }
  },

  /**
   * Obtiene todas las entregas de una tarea
   * GET /api/assignments/:id/submissions
   */
  async listSubmissionsByAssignment(
    assignmentId: number,
    filters?: {
      page?: number;
      limit?: number;
    }
  ): Promise<SubmissionsListResponse> {
    const response = await api.get(`/api/assignments/${assignmentId}/submissions`, {
      params: filters,
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener entregas');
    }

    return response.data.data;
  },

  /**
   * Obtiene el detalle de una entrega específica
   * GET /api/assignments/:id/submissions/:submissionId
   */
  async getSubmissionById(
    assignmentId: number,
    submissionId: number
  ): Promise<AssignmentSubmissionResponse> {
    const response = await api.get(
      `/api/assignments/${assignmentId}/submissions/${submissionId}`
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener la entrega');
    }

    return response.data.data;
  },

  /**
   * Envía una entrega de tarea (estudiante)
   * POST /api/assignments/:id/submissions
   */
  async submitAssignment(
    assignmentId: number,
    data: {
      attachmentUrl?: string;
      notes?: string;
    }
  ): Promise<AssignmentSubmissionResponse> {
    const response = await api.post(`/api/assignments/${assignmentId}/submissions`, data);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al enviar la entrega');
    }

    return response.data.data;
  },

  /**
   * Califica una entrega (docente)
   * PATCH /api/assignments/:id/submissions/:submissionId/grade
   */
  async gradeSubmission(
    assignmentId: number,
    submissionId: number,
    data: {
      score: number;
      feedback?: string;
    }
  ): Promise<AssignmentSubmissionResponse> {
    const response = await api.patch(
      `/api/assignments/${assignmentId}/submissions/${submissionId}/grade`,
      data
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al calificar la entrega');
    }

    return response.data.data;
  },

  /**
   * Elimina una entrega
   * DELETE /api/assignments/:id/submissions/:submissionId
   */
  async deleteSubmission(assignmentId: number, submissionId: number): Promise<void> {
    const response = await api.delete(
      `/api/assignments/${assignmentId}/submissions/${submissionId}`
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al eliminar la entrega');
    }
  },

  /**
   * Obtiene los estudiantes de una sección para calificar
   * GET /api/assignments/section/:sectionId/students
   * 
   * @param sectionId - ID de la sección
   * @param status - Filtro de estado: 'all', 'active', 'inactive' (default: 'all')
   * @returns Lista de estudiantes con su información de matrícula
   */
  async getSectionStudents(
    sectionId: number,
    status: 'all' | 'active' | 'inactive' = 'all'
  ): Promise<{
    sectionId: number;
    sectionName: string;
    status: string;
    totalStudents: number;
    students: Array<{
      enrollmentId: number;
      enrollmentStatus: string;
      student: {
        id: number;
        codeSIRE: string;
        givenNames: string;
        lastNames: string;
        email?: string;
        birthDate?: string;
        gender?: string;
      };
    }>;
  }> {
    const response = await api.get(`/api/assignments/section/${sectionId}/students`, {
      params: { status },
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener estudiantes de la sección');
    }

    return response.data.data;
  },

  /**
   * Obtiene las calificaciones ya guardadas para una asignación
   * GET /api/assignments/:assignmentId/grades
   * 
   * @param assignmentId - ID de la tarea
   * @returns Objeto con información de la tarea, calificaciones y estadísticas
   */
  async getAssignmentGrades(
    assignmentId: number
  ): Promise<{
    assignment: {
      id: number;
      title: string;
      maxScore: number;
      dueDate: string;
      description?: string;
    };
    grades: Array<{
      submissionId: number;
      enrollmentId: number;
      enrollmentStatus: string;
      student: {
        id: number;
        givenNames: string;
        lastNames: string;
        codeSIRE: string;
      };
      score: number;
      feedback?: string;
      submittedAt: string;
      gradedBy?: {
        id: number;
        name: string;
      };
      createdAt: string;
      updatedAt: string;
    }>;
    statistics: {
      total: number;
      graded: number;
      ungraded: number;
      averageScore: number;
      maxScore: number;
      minScore: number;
    };
  }> {
    try {
      const response = await api.get(`/api/assignments/${assignmentId}/grades`);

      console.log('🟢 [AssignmentsService] Get grades response:', response.data);

      if (!response.data?.success) {
        console.warn('⚠️ [AssignmentsService] Could not fetch grades:', response.data?.message);
        return {
          assignment: { id: 0, title: '', maxScore: 0, dueDate: '', description: '' },
          grades: [],
          statistics: { total: 0, graded: 0, ungraded: 0, averageScore: 0, maxScore: 0, minScore: 0 },
        };
      }

      return response.data.data || {
        assignment: { id: 0, title: '', maxScore: 0, dueDate: '', description: '' },
        grades: [],
        statistics: { total: 0, graded: 0, ungraded: 0, averageScore: 0, maxScore: 0, minScore: 0 },
      };
    } catch (err) {
      console.warn('⚠️ [AssignmentsService] Error fetching grades:', err);
      // No lanzar error, solo retornar objeto vacío para no romper el UI
      return {
        assignment: { id: 0, title: '', maxScore: 0, dueDate: '', description: '' },
        grades: [],
        statistics: { total: 0, graded: 0, ungraded: 0, averageScore: 0, maxScore: 0, minScore: 0 },
      };
    }
  },

  /**
   * Guarda calificaciones de múltiples estudiantes en lote
   * POST /api/assignments/:assignmentId/batch-grade
   * 
   * @param assignmentId - ID de la tarea
   * @param grades - Array de calificaciones con { enrollmentId, score, feedback? }
   * @returns Resultado del guardado
   */
  async batchGradeStudents(
    assignmentId: number,
    grades: Array<{
      enrollmentId: number;
      score: number;
      feedback?: string;
    }>
  ): Promise<{
    success: boolean;
    assignmentId: number;
    assignmentTitle: string;
    processedCount: number;
    successCount: number;
    failedCount: number;
    results: Array<{
      enrollmentId: number;
      success: boolean;
      submissionId?: number;
      score: number;
      studentName: string;
    }>;
  }> {
    console.log('🔵 [AssignmentsService] POST /api/assignments/:assignmentId/batch-grade', {
      assignmentId,
      gradesCount: grades.length,
      grades,
    });

    const response = await api.post(
      `/api/assignments/${assignmentId}/batch-grade`,
      {
        grades,
      }
    );

    console.log('🟢 [AssignmentsService] Batch grade response:', response.data);

    if (!response.data?.success) {
      const errorMsg =
        response.data?.message || `Error al guardar calificaciones (Status: ${response.status})`;
      console.error('🔴 [AssignmentsService] Error:', errorMsg);
      throw new Error(errorMsg);
    }

    return response.data;
  },

  /**
   * Obtiene todos los estudiantes con sus calificaciones por tarea
   * GET /api/assignments/course/:courseId/bimester/:bimesterId/students-submissions
   * 
   * Retorna:
   * - Todos los estudiantes inscritos en el curso
   * - Todas las tareas del curso-bimestre
   * - Calificaciones de cada estudiante en cada tarea (0 si no tiene registro)
   * - Información de si está calificado o no
   * - Totales de puntos obtenidos y máximos
   */
  async getStudentSubmissions(
    courseId: number,
    bimesterId: number
  ): Promise<StudentSubmissionsResponse> {
    console.log(
      '🔵 [AssignmentsService] GET /api/assignments/course/:courseId/bimester/:bimesterId/students-submissions',
      { courseId, bimesterId }
    );

    const response = await api.get(
      `/api/assignments/course/${courseId}/bimester/${bimesterId}/students-submissions`
    );

    console.log('🟢 [AssignmentsService] Student submissions response:', response.data);

    if (!response.data?.success) {
      const errorMsg =
        response.data?.message || `Error al obtener calificaciones de estudiantes (Status: ${response.status})`;
      console.error('🔴 [AssignmentsService] Error:', errorMsg);
      throw new Error(errorMsg);
    }

    return response.data;
  },
};
