// src/services/academic-analytics.service.ts

import { api } from '@/config/api';
import {
  AnalyticsData,
  AnalyticsDataResponse,
  StudentsSummaryResponse,
  OverallSummary,
  GetStudentsSummaryDto,
  GradeWithSections,
  GradeRange,
  GradeRangesResponse,
  PerformanceReport,
  PerformanceReportResponse,
  ComparativeAnalytics,
  ComparativeAnalyticsResponse,
  AtRiskStudentsData,
  AtRiskStudentsResponse,
  GradeDistributionStatistics,
  GradeDistributionStatisticsResponse,
  TopStudentsData,
  TopStudentsResponse,
} from '@/types/academic-analytics.types';

const ACADEMIC_ANALYTICS_ENDPOINT = 'api/academic-analytics';

/**
 * 📊 Servicio para Analítica Académica
 * Gestiona la obtención de reportes y análisis académicos de estudiantes
 */
export const academicAnalyticsService = {
  // ============================================
  // ANALYTICS DATA ENDPOINTS
  // ============================================

  /**
   * Obtiene datos en cascada para consultas analíticas
   * Retorna: ciclo escolar activo, bimestres, grados y secciones
   *
   * Endpoint: GET /api/academic-analytics/analytics-data
   *
   * @returns {Promise<AnalyticsData>} Datos en cascada para filtros
   *
   * @example
   * const data = await academicAnalyticsService.getAnalyticsData();
   * console.log(data.cycle);      // Ciclo activo
   * console.log(data.bimesters);  // Bimestres del ciclo
   * console.log(data.grades);     // Grados disponibles
   * console.log(data.gradesSections); // Secciones por grado
   */
  async getAnalyticsData(): Promise<AnalyticsData> {
    try {
      const response = await api.get<AnalyticsDataResponse>(
        `${ACADEMIC_ANALYTICS_ENDPOINT}/analytics-data`
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || 'Error al obtener datos de cascada'
        );
      }

      if (!response.data.data) {
        throw new Error('Datos de cascada no disponibles');
      }

      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new Error(
          'No tienes permisos para ver los datos de analítica académica'
        );
      }
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Error al cargar datos de cascada'
      );
    }
  },

  // ============================================
  // STUDENT SUMMARY ENDPOINTS
  // ============================================

  /**
   * Obtiene resúmenes académicos de TODOS los estudiantes con filtros múltiples
   *
   * Endpoint: GET /api/academic-analytics/students/by-grid
   *
   * Soporta filtración por:
   * - Ciclo escolar (requerido)
   * - Múltiples bimestres (opcional)
   * - Múltiples grados (opcional)
   * - Múltiples secciones (opcional)
   *
   * Retorna estructura anidada: Grado > Sección > Estudiantes
   *
   * @param cycleId - ID del ciclo escolar (requerido)
   * @param bimesterIds - IDs de bimestres (opcional, múltiple)
   * @param gradeIds - IDs de grados (opcional, múltiple)
   * @param sectionIds - IDs de secciones (opcional, múltiple)
   *
   * @returns {Promise<GradeWithSections[]>} Datos agrupados por grado y sección
   *
   * @example
   * const summaries = await academicAnalyticsService.getStudentsSummaryByGridFilter(
   *   1,           // cycleId
   *   [1, 2],      // bimesterIds (optional)
   *   [1, 2],      // gradeIds (optional)
   *   [1, 2]       // sectionIds (optional)
   * );
   */
  async getStudentsSummaryByGridFilter(
    cycleId: number,
    bimesterIds?: number[],
    gradeIds?: number[],
    sectionIds?: number[]
  ): Promise<GradeWithSections[]> {
    try {
      const params: any = {
        cycleId,
      };

      // Include optional filter arrays
      if (bimesterIds && bimesterIds.length > 0) {
        params.bimesterIds = bimesterIds;
      }
      if (gradeIds && gradeIds.length > 0) {
        params.gradeIds = gradeIds;
      }
      if (sectionIds && sectionIds.length > 0) {
        params.sectionIds = sectionIds;
      }

      const response = await api.get<StudentsSummaryResponse>(
        `${ACADEMIC_ANALYTICS_ENDPOINT}/students/by-grid`,
        { params }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || 'Error al obtener resúmenes académicos'
        );
      }

      if (!response.data.data?.grades || !Array.isArray(response.data.data.grades)) {
        throw new Error('Formato de respuesta inválido - esperado estructura con grades');
      }

      return response.data.data.grades;
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error('Parámetros de filtro inválidos');
      }
      if (error.response?.status === 403) {
        throw new Error(
          'No tienes permisos para ver los resúmenes académicos'
        );
      }
      if (error.response?.status === 404) {
        throw new Error(
          'Ciclo escolar, grado o sección no encontrados'
        );
      }
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Error al cargar resúmenes académicos'
      );
    }
  },

  // ============================================
  // GRADE RANGES ENDPOINTS
  // ============================================

  /**
   * Obtiene todos los rangos de calificaciones configurados en el sistema
   * Incluye información de colores, niveles educativos y letras de calificación
   *
   * Endpoint: GET /api/academic-analytics/grade-ranges
   *
   * @returns {Promise<GradeRange[]>} Lista de rangos de calificaciones ordenados por puntuación mínima
   *
   * @example
   * const ranges = await academicAnalyticsService.getGradeRanges();
   * // Usar los rangos para determinar colores según la calificación
   */
  async getGradeRanges(): Promise<GradeRange[]> {
    try {
      const response = await api.get<GradeRangesResponse>(
        `${ACADEMIC_ANALYTICS_ENDPOINT}/grade-ranges`
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || 'Error al obtener rangos de calificaciones'
        );
      }

      if (!Array.isArray(response.data.data)) {
        throw new Error('Formato de respuesta inválido - esperado array de rangos');
      }

      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new Error(
          'No tienes permisos para ver los rangos de calificaciones'
        );
      }
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Error al cargar rangos de calificaciones'
      );
    }
  },

  // ============================================
  // PERFORMANCE REPORT ENDPOINT
  // ============================================

  /**
   * Obtiene el reporte detallado de desempeño de un estudiante
   * Incluye desglose por bimestre con componentes, trend y predicción de calificación final
   *
   * Endpoint: GET /api/academic-analytics/student/:enrollmentId/performance-report
   *
   * @param enrollmentId - ID de la matrícula del estudiante
   *
   * @returns {Promise<PerformanceReport>} Reporte detallado de desempeño
   *
   * @example
   * const report = await academicAnalyticsService.getPerformanceReport(123);
   * console.log(report.bimesterDetails);      // Detalles por bimestre
   * console.log(report.predictedFinalGrade);  // Predicción de calificación final
   * console.log(report.performanceRecommendations); // Recomendaciones
   */
  async getPerformanceReport(enrollmentId: number): Promise<PerformanceReport> {
    try {
      const response = await api.get<PerformanceReportResponse>(
        `${ACADEMIC_ANALYTICS_ENDPOINT}/student/${enrollmentId}/performance-report`
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || 'Error al obtener reporte de desempeño'
        );
      }

      if (!response.data.data) {
        throw new Error('Datos del reporte de desempeño no disponibles');
      }

      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error('ID de matrícula inválido');
      }
      if (error.response?.status === 403) {
        throw new Error(
          'No tienes permisos para ver el reporte de desempeño de este estudiante'
        );
      }
      if (error.response?.status === 404) {
        throw new Error('Estudiante no encontrado');
      }
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Error al cargar reporte de desempeño'
      );
    }
  },

  // ============================================
  // COMPARATIVE ANALYTICS ENDPOINT
  // ============================================

  /**
   * Obtiene análisis comparativo de una sección
   * Incluye estudiantes destacados, en riesgo, ranking y distribución de calificaciones
   *
   * Endpoint: GET /api/academic-analytics/comparative
   *
   * @param gradeId - ID del grado (requerido)
   * @param sectionId - ID de la sección (requerido)
   * @param enrollmentId - ID de matrícula para comparar posición del estudiante (opcional)
   *
   * @returns {Promise<ComparativeAnalytics>} Análisis comparativo de la sección
   *
   * @example
   * const comparative = await academicAnalyticsService.getComparativeAnalytics(1, 1, 123);
   * console.log(comparative.classAverage);    // Promedio de la clase
   * console.log(comparative.topStudents);     // Top 5 estudiantes
   * console.log(comparative.currentStudent);  // Posición del estudiante actual
   */
  async getComparativeAnalytics(
    gradeId: number,
    sectionId: number,
    enrollmentId?: number
  ): Promise<ComparativeAnalytics> {
    try {
      const params: any = {
        gradeId,
        sectionId,
      };

      if (enrollmentId) {
        params.enrollmentId = enrollmentId;
      }

      const response = await api.get<ComparativeAnalyticsResponse>(
        `${ACADEMIC_ANALYTICS_ENDPOINT}/comparative`,
        { params }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || 'Error al obtener análisis comparativo'
        );
      }

      if (!response.data.data) {
        throw new Error('Datos del análisis comparativo no disponibles');
      }

      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error('Parámetros inválidos para análisis comparativo');
      }
      if (error.response?.status === 403) {
        throw new Error(
          'No tienes permisos para ver el análisis comparativo'
        );
      }
      if (error.response?.status === 404) {
        throw new Error('Grado o sección no encontrados');
      }
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Error al cargar análisis comparativo'
      );
    }
  },

  // ============================================
  // AT-RISK STUDENTS ENDPOINT
  // ============================================

  /**
   * Obtiene lista de estudiantes en riesgo académico o de asistencia
   * Incluye niveles de riesgo, detalles de asistencia y recomendaciones
   *
   * Endpoint: GET /api/academic-analytics/at-risk-students
   *
   * @param gradeId - ID del grado (requerido)
   * @param sectionId - ID de la sección (requerido)
   *
   * @returns {Promise<AtRiskStudentsData>} Datos de estudiantes en riesgo
   *
   * @example
   * const atRisk = await academicAnalyticsService.getAtRiskStudents(1, 1);
   * console.log(atRisk.students);        // Estudiantes en riesgo
   * console.log(atRisk.criticalRiskCount); // Cantidad de estudiantes en riesgo crítico
   */
  async getAtRiskStudents(
    gradeId: number,
    sectionId: number
  ): Promise<AtRiskStudentsData> {
    try {
      const params = {
        gradeId,
        sectionId,
      };

      const response = await api.get<AtRiskStudentsResponse>(
        `${ACADEMIC_ANALYTICS_ENDPOINT}/at-risk-students`,
        { params }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || 'Error al obtener estudiantes en riesgo'
        );
      }

      if (!response.data.data) {
        throw new Error('Datos de estudiantes en riesgo no disponibles');
      }

      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error('Parámetros inválidos para obtener estudiantes en riesgo');
      }
      if (error.response?.status === 403) {
        throw new Error(
          'No tienes permisos para ver estudiantes en riesgo'
        );
      }
      if (error.response?.status === 404) {
        throw new Error('Grado o sección no encontrados');
      }
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Error al cargar estudiantes en riesgo'
      );
    }
  },

  // ============================================
  // GRADE DISTRIBUTION STATISTICS ENDPOINT
  // ============================================

  /**
   * Obtiene estadísticas de distribución de calificaciones
   * Incluye media, mediana, desviación estándar, cuartiles y distribución de categorías
   *
   * Endpoint: GET /api/academic-analytics/statistics
   *
   * @param gradeId - ID del grado (requerido)
   * @param sectionId - ID de la sección (opcional)
   * @param courseId - ID del curso (opcional)
   * @param bimesterId - ID del bimestre (opcional)
   *
   * @returns {Promise<GradeDistributionStatistics>} Estadísticas de distribución
   *
   * @example
   * const stats = await academicAnalyticsService.getGradeDistributionStatistics(1, 1);
   * console.log(stats.statistics.mean);      // Media
   * console.log(stats.statistics.standardDeviation); // Desviación estándar
   * console.log(stats.distribution);        // Distribución por categorías
   */
  async getGradeDistributionStatistics(
    gradeId: number,
    sectionId?: number | null,
    courseId?: number | null,
    bimesterId?: number | null
  ): Promise<GradeDistributionStatistics> {
    try {
      const params: any = {
        gradeId,
      };

      if (sectionId) {
        params.sectionId = sectionId;
      }
      if (courseId) {
        params.courseId = courseId;
      }
      if (bimesterId) {
        params.bimesterId = bimesterId;
      }

      const response = await api.get<GradeDistributionStatisticsResponse>(
        `${ACADEMIC_ANALYTICS_ENDPOINT}/statistics`,
        { params }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || 'Error al obtener estadísticas'
        );
      }

      if (!response.data.data) {
        throw new Error('Datos de estadísticas no disponibles');
      }

      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error('Parámetros inválidos para estadísticas');
      }
      if (error.response?.status === 403) {
        throw new Error(
          'No tienes permisos para ver estadísticas'
        );
      }
      if (error.response?.status === 404) {
        throw new Error('Grado, sección, curso o bimestre no encontrados');
      }
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Error al cargar estadísticas'
      );
    }
  },

  // ============================================
  // TOP STUDENTS ENDPOINT
  // ============================================

  /**
   * Obtiene los N mejores estudiantes ordenados por promedio descendente
   * Agrupados por grado y sección
   *
   * Endpoint: GET /api/academic-analytics/students/top
   *
   * Parámetros:
   * - cycleId: ID del ciclo escolar (requerido)
   * - top: Cantidad de mejores estudiantes a retornar por grupo (requerido)
   * - bimesterIds: IDs de bimestres (opcional, múltiple)
   * - gradeIds: IDs de grados (opcional, múltiple)
   * - sectionIds: IDs de secciones (opcional, múltiple)
   *
   * @param cycleId - ID del ciclo escolar
   * @param top - Cantidad de mejores estudiantes a mostrar
   * @param bimesterIds - IDs de bimestres para filtrar (opcional)
   * @param gradeIds - IDs de grados para filtrar (opcional)
   * @param sectionIds - IDs de secciones para filtrar (opcional)
   *
   * @returns {Promise<TopStudentsData>} Datos de mejores estudiantes agrupados por grado y sección
   *
   * @example
   * // Top 10 de todo el ciclo
   * const top = await academicAnalyticsService.getTopStudents(1, 10);
   *
   * // Top 5 de grado 1, sección 1
   * const top = await academicAnalyticsService.getTopStudents(1, 5, undefined, [1], [1]);
   *
   * // Top 3 basado en bimestres 1 y 2
   * const top = await academicAnalyticsService.getTopStudents(1, 3, [1, 2]);
   */
  async getTopStudents(
    cycleId: number,
    top: number,
    bimesterIds?: number[],
    gradeIds?: number[],
    sectionIds?: number[]
  ): Promise<TopStudentsData> {
    try {
      const params: any = {
        cycleId,
        top,
      };

      if (bimesterIds && bimesterIds.length > 0) {
        params.bimesterIds = bimesterIds;
      }
      if (gradeIds && gradeIds.length > 0) {
        params.gradeIds = gradeIds;
      }
      if (sectionIds && sectionIds.length > 0) {
        params.sectionIds = sectionIds;
      }

      const response = await api.get<TopStudentsResponse>(
        `${ACADEMIC_ANALYTICS_ENDPOINT}/students/top`,
        { params }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || 'Error al obtener mejores estudiantes'
        );
      }

      if (!response.data.data) {
        throw new Error('Datos de mejores estudiantes no disponibles');
      }

      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error('Parámetros inválidos para obtener mejores estudiantes');
      }
      if (error.response?.status === 403) {
        throw new Error(
          'No tienes permisos para ver los mejores estudiantes'
        );
      }
      if (error.response?.status === 404) {
        throw new Error('Ciclo, grado, sección o bimestre no encontrados');
      }
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Error al cargar mejores estudiantes'
      );
    }
  },
};

export default academicAnalyticsService;
