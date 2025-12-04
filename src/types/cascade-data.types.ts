// src/types/cascade-data.types.ts

export interface SchoolCycle {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  isArchived: boolean;
  academicYear: number | null;
}

export interface Bimester {
  id: number;
  cycleId: number;
  number: number;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  weeksCount: number;
}

export interface AcademicWeek {
  id: number;
  bimesterId: number;
  number: number;
  startDate: Date;
  endDate: Date;
  objectives: string | null;
  weekType: string;
}

export interface Grade {
  id: number;
  name: string;
  level: string;
  order: number;
  isActive: boolean;
}

export interface Course {
  id: number;
  code: string;
  name: string;
  area: string | null;
  color: string | null;
  isActive: boolean;
}

// Docente básico para cascade-data
export interface CascadeTeacher {
  id: number;
  givenNames: string;
  lastNames: string;
  email: string | null;
}

// Asignación de curso con docente
export interface CourseAssignment {
  id: number;
  course: Course;
  teacher: CascadeTeacher;
}

// Sección con docente director y cursos asignados
export interface Section {
  id: number;
  name: string;
  capacity: number;
  gradeId: number;
  teacher: CascadeTeacher | null; // Docente director de sección
  courseAssignments: CourseAssignment[];
}

// Respuesta principal del cascade-data/all
export interface CascadeDataResponse {
  cycle: SchoolCycle;
  activeBimester: Bimester | null;
  weeks: AcademicWeek[];
  grades: Grade[];
  gradesSections: {
    [gradeId: string]: Section[];
  };
}

// Query types
export interface CascadeDataQuery {
  includeInactive?: boolean;
  cycleId?: number;
  bimesterId?: number;
  gradeId?: number;
}

// Error types y códigos estandarizados
export type CascadeErrorType =
  | 'NO_ACTIVE_CYCLE'
  | 'NO_ACTIVE_BIMESTER'
  | 'NO_WEEKS'
  | 'NO_GRADES'
  | 'NO_COURSES'
  | 'INVALID_ID'
  | 'API_ERROR'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

export interface CascadeError extends Error {
  type: CascadeErrorType;
  statusCode?: number;
  context?: Record<string, any>;
}

export const CascadeErrorMessages: Record<CascadeErrorType, string> = {
  NO_ACTIVE_CYCLE: 'No hay un ciclo escolar activo en el sistema',
  NO_ACTIVE_BIMESTER: 'No hay bimestre activo para el ciclo escolar',
  NO_WEEKS: 'No hay semanas académicas registradas',
  NO_GRADES: 'No hay grados disponibles',
  NO_COURSES: 'No hay cursos disponibles',
  INVALID_ID: 'ID inválido proporcionado',
  API_ERROR: 'Error al comunicarse con el servidor',
  NETWORK_ERROR: 'Error de conexión de red',
  UNKNOWN_ERROR: 'Error desconocido al obtener datos académicos',
};
