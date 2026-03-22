// src/types/academic-analytics.types.ts

/**
 * 📊 Tipos para Academic Analytics (Analítica Académica)
 *
 * Tipos para reportes y análisis académicos de estudiantes
 */

// ============================================
// ENTITIES - Cascada de datos
// ============================================

/**
 * Ciclo escolar base
 */
export interface Cycle {
  id: number;
  name: string;
  startDate: string; // ISO 8601 date
  endDate: string; // ISO 8601 date
}

/**
 * Bimestre con fechas
 */
export interface Bimester {
  id: number;
  number: number; // 1, 2, 3, 4
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

/**
 * Grado académico para cascada
 */
export interface GradeForCascade {
  id: number;
  name: string;
}

/**
 * Sección académica para cascada
 */
export interface SectionForCascade {
  id: number;
  name: string;
}

/**
 * Datos en cascada para filtros
 * Retorna: ciclo activo, bimestres, grados y secciones agrupadas por grado
 */
export interface AnalyticsData {
  cycle: Cycle;
  bimesters: Bimester[];
  grades: GradeForCascade[];
  gradesSections: Record<number, SectionForCascade[]>; // { gradeId: [sections] }
}

// ============================================
// ENTITIES - Resumen académico
// ============================================

/**
 * Información básica del estudiante
 */
export interface StudentBasic {
  id: number;
  enrollmentId: number;
  givenNames: string;
  lastNames: string;
}

/**
 * Información del grado académico
 */
export interface GradeInfo {
  id: number;
  name: string;
  level?: string; // "Primaria", "Secundaria", etc.
}

/**
 * Información de la sección académica
 */
export interface SectionInfo {
  id: number;
  name: string;
}

/**
 * Promedios acumulativos por bimestres
 */
export interface CumulativeAverages {
  bimester1: number | null;
  bimester2: number | null;
  bimester3: number | null;
  bimester4: number | null;
  promedio: number | null; // Promedio acumulativo final
}

/**
 * Tendencia académica del estudiante
 */
export type AcademicTrend = 'IMPROVING' | 'STABLE' | 'DECLINING';

/**
 * Estado académico del estudiante
 */
export type AcademicStatus = 'EXCELLENT' | 'ON_TRACK' | 'AT_RISK' | 'FAILING';

/**
 * Rango de calificaciones configurado en el sistema
 */
export interface GradeRange {
  id: number;
  name: string;
  description: string;
  minScore: number;
  maxScore: number;
  hexColor: string;
  level: string; // "all", "Primaria", "Secundaria", etc.
  letterGrade: string | null;
  isActive: boolean;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}

/**
 * Respuesta para obtener rangos de calificaciones
 */
export interface GradeRangesResponse {
  success: boolean;
  message: string;
  data: GradeRange[];
}

/**
 * Resumen académico completo de un estudiante (para compatibilidad)
 */
export interface OverallSummary {
  student: StudentBasic;
  cumulativeAverages: CumulativeAverages;
  trend: AcademicTrend;
  academicStatus: AcademicStatus;
}

// ============================================
// DTOs (Data Transfer Objects)
// ============================================

/**
 * Query para obtener resúmenes de estudiantes por grid (grado, sección, ciclo)
 * Soporta filtración múltiple
 */
export interface GetStudentsSummaryDto {
  cycleId: number; // Required
  bimesterIds?: number[]; // Optional: filter by specific bimesters
  gradeIds?: number[]; // Optional: filter by multiple grades
  sectionIds?: number[]; // Optional: filter by multiple sections
}

// ============================================
// RESPONSES
// ============================================

/**
 * Respuesta para getAnalyticsData
 */
export interface AnalyticsDataResponse {
  success: boolean;
  message: string;
  data: AnalyticsData;
}

/**
 * Estudiante con resumen académico dentro de una sección
 */
export interface StudentSummaryInSection {
  student: StudentBasic;
  cumulativeAverages: CumulativeAverages;
  trend: AcademicTrend;
  academicStatus: AcademicStatus;
}

/**
 * Sección con estudiantes
 */
export interface SectionWithStudents {
  section: SectionInfo;
  students: StudentSummaryInSection[];
}

/**
 * Grado con secciones y estudiantes
 */
export interface GradeWithSections {
  grade: GradeInfo;
  sections: SectionWithStudents[];
}

/**
 * Respuesta para getStudentsSummaryByGrid
 */
export interface StudentsSummaryResponse {
  success: boolean;
  message: string;
  data: {
    grades: GradeWithSections[];
  };
}

// ============================================
// UI HELPERS & FILTERS
// ============================================

/**
 * Filtros para la página de analytics
 */
export interface AcademicAnalyticsFilters {
  cycleId?: number;
  gradeId?: number;
  sectionId?: number;
}

/**
 * Estado del formulario de filtros
 */
export interface AnalyticsFilterState {
  cycleId: number | null;
  gradeIds: number[]; // Multiple selection
  sectionIds: number[]; // Multiple selection
  bimesterIds: number[]; // Multiple selection
  isLoading: boolean;
  error: string | null;
}

/**
 * Opciones seleccionadas en cascada
 */
export interface CascadeSelection {
  cycle: Cycle | null;
  grades: GradeForCascade[];
  grade: GradeForCascade | null;
  sections: SectionForCascade[];
  section: SectionForCascade | null;
}

// ============================================
// ENDPOINT 1: Performance Report (Reporte de Desempeño)
// ============================================

/**
 * Componentes de la calificación por bimestre
 */
export interface BimesterComponents {
  ericaScore: number;      // 0-40
  tasksScore: number;      // 0-20
  actitudinalScore: number; // 0-10
  declarativoScore: number; // 0-30
}

/**
 * Detalle de cada bimestre
 */
export interface BimesterDetail {
  bimesterNumber: number;
  bimesterName: string;
  components: BimesterComponents;
  average: number;
  status: string; // GOOD, FAIR, POOR, etc.
}

/**
 * Respuesta del reporte de desempeño
 */
export interface PerformanceReport {
  student: StudentBasic;
  cycle: Cycle;
  cumulativeAverages: CumulativeAverages;
  bimesterDetails: BimesterDetail[];
  trend: AcademicTrend;
  academicStatus: AcademicStatus;
  predictedFinalGrade: number;
  performanceRecommendations: string[];
}

export interface PerformanceReportResponse {
  success: boolean;
  message: string;
  data: PerformanceReport;
}

// ============================================
// ENDPOINT 2: Comparative Analytics (Análisis Comparativo)
// ============================================

/**
 * Información de un estudiante en el análisis comparativo
 */
export interface ComparativeStudent {
  student: StudentBasic;
  promedio: number;
  academicStatus: AcademicStatus;
  percentile: number;
  rank: number;
  deviation: number;
}

/**
 * Distribución de calificaciones
 */
export interface GradeDistribution {
  excellent: number;  // >= 90
  onTrack: number;    // 70-89
  atRisk: number;     // < 70
}

/**
 * Respuesta del análisis comparativo
 */
export interface ComparativeAnalytics {
  section: SectionInfo;
  grade: GradeInfo;
  classAverage: number;
  classMedian: number;
  standardDeviation: number;
  studentCount: number;
  topStudents: ComparativeStudent[];
  atRiskStudents: ComparativeStudent[];
  currentStudent?: ComparativeStudent;
  distribution: GradeDistribution;
}

export interface ComparativeAnalyticsResponse {
  success: boolean;
  message: string;
  data: ComparativeAnalytics;
}

// ============================================
// ENDPOINT 3: At-Risk Students (Estudiantes en Riesgo)
// ============================================

/**
 * Detalles de asistencia
 */
export interface AbsenceDetails {
  totalAbsences: number;
  unjustifiedAbsences: number;
  consecutiveDays: number;
}

/**
 * Alerta de asistencia
 */
export interface AttendanceAlert {
  absenceCount: number;
  attendance: number;
  isAlert: boolean;
}

/**
 * Nivel de riesgo académico
 */
export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

/**
 * Estudiante en riesgo con detalles
 */
export interface AtRiskStudent {
  student: StudentBasic;
  academicStatus: AcademicStatus;
  promedio: number;
  academicRiskLevel: RiskLevel;
  attendanceAlert: AttendanceAlert;
  attendanceRiskLevel: RiskLevel;
  absenceDetails: AbsenceDetails;
  lastUpdate: string; // ISO date
  recommendations: string[];
}

/**
 * Respuesta de estudiantes en riesgo
 */
export interface AtRiskStudentsData {
  grade: GradeInfo;
  section: SectionInfo;
  criticalRiskCount: number;
  highRiskCount: number;
  totalStudentsAtRisk: number;
  students: AtRiskStudent[];
}

export interface AtRiskStudentsResponse {
  success: boolean;
  message: string;
  data: AtRiskStudentsData;
}

// ============================================
// ENDPOINT 4: Grade Distribution Statistics
// ============================================

/**
 * Estadísticas descriptivas
 */
export interface DescriptiveStatistics {
  mean: number;
  median: number;
  mode: number;
  standardDeviation: number;
  variance: number;
  minScore: number;
  maxScore: number;
  range: number;
  q1: number;  // Primer cuartil
  q3: number;  // Tercer cuartil
  iqr: number; // Rango intercuartílico
}

/**
 * Distribución por categorías
 */
export interface ScoreDistribution {
  excellent: { count: number; percentage: number };    // >= 90
  good: { count: number; percentage: number };         // 80-89
  satisfactory: { count: number; percentage: number }; // 70-79
  needsImprovement: { count: number; percentage: number }; // < 70
}

/**
 * Curso (opcional en estadísticas)
 */
export interface Course {
  id: number;
  name: string;
}

/**
 * Respuesta de estadísticas
 */
export interface GradeDistributionStatistics {
  grade: GradeInfo;
  section?: SectionInfo;
  course?: Course;
  bimester?: Bimester;
  statistics: DescriptiveStatistics;
  distribution: ScoreDistribution;
  totalStudents: number;
}

export interface GradeDistributionStatisticsResponse {
  success: boolean;
  message: string;
  data: GradeDistributionStatistics;
}

// ============================================
// ENDPOINT 5: Top N Best Students
// ============================================

/**
 * Estudiante con resumen académico para rankings
 */
export interface TopStudentSummary {
  student: StudentBasic;
  cumulativeAverages: CumulativeAverages;
  trend: AcademicTrend;
  academicStatus: AcademicStatus;
}

/**
 * Sección con lista de mejores estudiantes
 */
export interface TopStudentsSection {
  section: SectionInfo;
  students: TopStudentSummary[];
}

/**
 * Grado con secciones y mejores estudiantes
 */
export interface TopStudentsGrade {
  grade: GradeInfo;
  sections: TopStudentsSection[];
}

/**
 * Datos de top N estudiantes agrupados por grado y sección
 */
export interface TopStudentsData {
  grades: TopStudentsGrade[];
}

/**
 * Respuesta del endpoint de top estudiantes
 */
export interface TopStudentsResponse {
  success: boolean;
  message: string;
  data: TopStudentsData;
}
