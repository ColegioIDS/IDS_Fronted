/**
 * ====================================================================
 * ATTENDANCE REPORTS TYPES
 * ====================================================================
 *
 * Tipos e interfaces para el módulo de reportes de asistencia
 * Alineados con los endpoints del backend
 */

// ====================================================================
// TIPOS BASE
// ====================================================================

/**
 * Respuesta estándar del servidor
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  total?: number;
  reportDate?: string;
  period?: {
    startDate: string;
    endDate: string;
  };
  appliedFilters?: Record<string, any>;
  error?: string;
  statusCode?: number;
}

// ====================================================================
// RESUMEN GENERAL (Summary)
// ====================================================================

/**
 * Estadísticas generales de asistencia del sistema
 */
export interface AttendanceSummary {
  totalRegistrations?: number;
  presentCount?: number;
  absentCount?: number;
  lateCount?: number;
  justifiedCount?: number;
  averageAttendance?: number;
  studentsTotal?: number;
  sectionsTotal?: number;
  // Campos adicionales del API
  totalStudents?: number;
  totalRecords?: number;
  attendancePercentage?: number;
  absencePercentage?: number;
  temporalCount?: number;
  temporalJustifiedCount?: number;
  absentJustifiedCount?: number;
  reportDate?: string;
  period?: {
    startDate: string;
    endDate: string;
  };
}

// ====================================================================
// DESGLOSE POR ESTADO (By Status)
// ====================================================================

/**
 * Conteo de registros por estado de asistencia
 */
export interface AttendanceByStatus {
  statusId: number;
  statusName: string;
  statusCode: string;
  count: number;
  percentage: number;
  color?: string;
}

/**
 * Respuesta de desglose por estado
 */
export interface AttendanceByStatusResponse {
  statuses: AttendanceByStatus[];
  totalRecords: number;
  period: {
    startDate: string;
    endDate: string;
  };
}

// ====================================================================
// ESTADÍSTICAS Y TENDENCIAS (Statistics)
// ====================================================================

/**
 * Punto de datos para tendencias
 */
export interface TrendDataPoint {
  date: string;
  week?: number;
  month?: string;
  attendance: number;
  present: number;
  absent: number;
  total: number;
}

/**
 * Alertas por ausencias consecutivas
 */
export interface AbsenceAlert {
  enrollmentId: number;
  studentName: string;
  consecutiveAbsences: number;
  lastAbsentDate: string;
  riskLevel: 'low' | 'medium' | 'high';
}

/**
 * Estadísticas completas de asistencia
 */
export interface AttendanceStatistics {
  summary: {
    averageAttendance: number;
    presentPercentage: number;
    absentPercentage: number;
    totalRecords: number;
  };
  byStatus: AttendanceByStatus[];
  trends: TrendDataPoint[];
  alerts: AbsenceAlert[];
  atRiskCount: number;
  period: {
    startDate: string;
    endDate: string;
  };
}

// ====================================================================
// REPORTE POR ESTUDIANTE (Student Report)
// ====================================================================

/**
 * Registro individual de asistencia
 */
export interface AttendanceRecord {
  id: number;
  date: string;
  dayOfWeek: string;
  statusId: number;
  statusName: string;
  statusCode: string;
  remarks?: string;
}

/**
 * Reporte completo de un estudiante
 */
export interface StudentAttendanceReport {
  enrollmentId: number;
  studentId: number;
  studentName: string;
  studentEmail?: string;
  identificationNumber?: string;
  gradeId: number;
  gradeName: string;
  sectionId: number;
  sectionName: string;
  totalClasses: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  justifiedAbsences: number;
  attendancePercentage: number;
  status: 'excellent' | 'good' | 'at-risk';
  records: AttendanceRecord[];
  period: {
    startDate: string;
    endDate: string;
  };
}

// ====================================================================
// REPORTE POR SECCIÓN (Section Report)
// ====================================================================

/**
 * Resumen de asistencia de un estudiante en la sección
 */
export interface StudentSectionSummary {
  enrollmentId: number;
  studentName: string;
  attendancePercentage: number;
  presentDays: number;
  absentDays: number;
  status: 'excellent' | 'good' | 'at-risk';
}

/**
 * Reporte completo de una sección
 */
export interface SectionAttendanceReport {
  sectionId: number;
  sectionName: string;
  gradeId: number;
  gradeName: string;
  totalStudents: number;
  averageAttendance: number;
  presentPercentage: number;
  absentPercentage: number;
  atRiskCount: number;
  excellentCount: number;
  goodCount: number;
  students: StudentSectionSummary[];
  period: {
    startDate: string;
    endDate: string;
  };
}

// ====================================================================
// REPORTE POR GRADO (Grade Report)
// ====================================================================

/**
 * Resumen de sección dentro del reporte de grado
 */
export interface SectionGradeSummary {
  sectionId: number;
  sectionName: string;
  totalStudents: number;
  averageAttendance: number;
  atRiskCount: number;
}

/**
 * Reporte completo de un grado
 */
export interface GradeAttendanceReport {
  gradeId: number;
  gradeName: string;
  totalStudents: number;
  totalSections: number;
  averageAttendance: number;
  atRiskCount: number;
  sections: SectionGradeSummary[];
  period: {
    startDate: string;
    endDate: string;
  };
}

// ====================================================================
// ASISTENCIA POR GRADO Y SECCIÓN (Grade-Section Breakdown)
// ====================================================================

/**
 * Entrada en la lista agrupada por grado y sección
 */
export interface GradeSectionEntry {
  gradeId: number;
  gradeName: string;
  sectionId: number;
  sectionName: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  averageAttendance: number;
  atRiskCount: number;
}

/**
 * Respuesta agrupada por grado y sección
 */
export interface GradeSectionBreakdown {
  entries: GradeSectionEntry[];
  period: {
    startDate: string;
    endDate: string;
  };
  cycleId?: number;
  bimesterId?: number;
}

// ====================================================================
// ESTUDIANTES EN RIESGO (At Risk)
// ====================================================================

/**
 * Información de estudiante en riesgo
 */
export interface AtRiskStudent {
  enrollmentId: number;
  studentId: number;
  studentName: string;
  studentEmail?: string;
  gradeId: number;
  gradeName: string;
  sectionId: number;
  sectionName: string;
  attendancePercentage: number;
  absentDays: number;
  consecutiveAbsences: number;
  lastAbsentDate: string;
  riskScore: number; // 0-100, mayor = más riesgo
  riskLevel: 'moderate' | 'high' | 'critical';
  recommendedAction: string;
}

/**
 * Respuesta paginada de estudiantes en riesgo
 */
export interface AtRiskStudentsResponse {
  students: AtRiskStudent[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  bimesterId?: number;
}

// ====================================================================
// ASISTENCIA SEMANAL (Weekly)
// ====================================================================

/**
 * Datos de una semana
 */
export interface WeeklyAttendanceData {
  weekId: number;
  weekNumber: number;
  startDate: string;
  endDate: string;
  averageAttendance: number;
  presentCount: number;
  absentCount: number;
  totalRecords: number;
}

/**
 * Respuesta de asistencia semanal
 */
export interface WeeklyAttendanceResponse {
  weeks: WeeklyAttendanceData[];
  cycleId?: number;
  period: {
    startDate: string;
    endDate: string;
  };
}

/**
 * Asistencia de una semana específica por grado/sección
 */
export interface WeeklyDetailBySection {
  weekId: number;
  weekNumber: number;
  startDate: string;
  endDate: string;
  sections: GradeSectionEntry[];
}

// ====================================================================
// ASISTENCIA POR BIMESTRE (Bimester)
// ====================================================================

/**
 * Estadísticas de un bimestre
 */
export interface BimesterAttendanceReport {
  bimesterId: number;
  bimesterName: string;
  bimesterOrder: number;
  startDate: string;
  endDate: string;
  totalStudents: number;
  averageAttendance: number;
  presentPercentage: number;
  absentPercentage: number;
  atRiskCount: number;
  excellentCount: number;
  goodCount: number;
  cycleId?: number;
}

// ====================================================================
// ASISTENCIA DEL CICLO ESCOLAR (Cycle)
// ====================================================================

/**
 * Desglose por bimestre en reporte de ciclo
 */
export interface BimesterSummaryInCycle {
  bimesterId: number;
  bimesterName: string;
  bimesterOrder: number;
  averageAttendance: number;
  atRiskCount: number;
}

/**
 * Estadísticas completas del ciclo escolar
 */
export interface CycleAttendanceReport {
  cycleId: number;
  cycleName: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  totalStudents: number;
  averageAttendance: number;
  presentPercentage: number;
  absentPercentage: number;
  atRiskCount: number;
  bimesters: BimesterSummaryInCycle[];
}

// ====================================================================
// INFORMACIÓN DE CICLO/BIMESTRE/SEMANA (Academic Info)
// ====================================================================

/**
 * Información del ciclo escolar activo
 */
export interface ActiveCycleInfo {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  currentBimesterId?: number;
}

/**
 * Información del bimestre
 */
export interface BimesterInfo {
  id: number;
  name: string;
  order: number;
  cycleId: number;
  startDate: string;
  endDate: string;
}

/**
 * Información de la semana académica
 */
export interface WeekInfo {
  id: number;
  weekNumber: number;
  startDate: string;
  endDate: string;
  objective?: string;
  bimesterId: number;
  cycleId: number;
}

// ====================================================================
// QUERY PARAMS Y FILTROS
// ====================================================================

/**
 * Parámetros comunes para reportes
 */
export interface ReportQueryParams {
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  cycleId?: number;
  bimesterId?: number;
  gradeId?: number;
  sectionId?: number;
  enrollmentId?: number;
  page?: number;
  limit?: number;
  period?: 'day' | 'week' | 'month' | 'bimester';
  includeTrends?: boolean;
}

// ====================================================================
// TIPOS PARA GRÁFICOS
// ====================================================================

/**
 * Datos para gráfico de línea (tendencia)
 */
export interface ChartTrendData {
  dates: string[];
  attendance: number[];
  present: number[];
  absent: number[];
}

/**
 * Datos para gráfico de pastel (distribución)
 */
export interface ChartPieData {
  name: string;
  value: number;
  percentage: number;
}

/**
 * Datos para gráfico de barras (comparación)
 */
export interface ChartBarData {
  name: string;
  value: number;
  color?: string;
}
