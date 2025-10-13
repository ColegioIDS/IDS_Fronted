// types/academic-week.types.ts

// ✅ Enum para tipos de semana
export type WeekType = 'REGULAR' | 'EVALUATION' | 'REVIEW';

export interface BimesterInfo {
  id: number;
  name: string;
  number: number;
  cycle?: {
    id: number;
    name: string;
  };
}

export interface AcademicWeek {
  id: number;
  bimesterId: number;
  number: number;
  startDate: string; // ISO string
  endDate: string;   // ISO string
  objectives?: string | null;
  weekType: WeekType; // ✅ NUEVO
  bimester?: BimesterInfo;
}

// Tipo para crear una semana académica
export interface AcademicWeekFormValues {
  bimesterId: number;
  number: number;
  startDate: string;
  endDate: string;
  objectives?: string;
  weekType?: WeekType; // ✅ NUEVO - opcional, default REGULAR
}

// Tipo para actualización parcial
export interface UpdateAcademicWeekFormValues {
  bimesterId?: number;
  number?: number;
  startDate?: string;
  endDate?: string;
  objectives?: string;
  weekType?: WeekType; // ✅ NUEVO
}

// Tipo para filtros
export interface AcademicWeekFilters {
  bimesterId?: number;
  number?: number;
  weekType?: 'REGULAR' | 'EVALUATION' | 'REVIEW'; // ✅ Si aún no lo tienes
  status?: 'completed' | 'active' | 'upcoming'; // ✅ AGREGAR
  hasObjectives?: boolean; // ✅ AGREGAR
}

// Tipo para generar semanas automáticamente
export interface GenerateWeeksRequest {
  weeksCount?: number;
  includeEvaluationWeek?: boolean; // ✅ NUEVO - incluir semana de evaluación
}

// Tipo para respuesta de semana actual
export interface CurrentWeekResponse {
  message?: string;
  id?: number;
  bimesterId?: number;
  number?: number;
  startDate?: string;
  endDate?: string;
  objectives?: string | null;
  weekType?: WeekType; // ✅ NUEVO
  bimester?: BimesterInfo;
}

// ✅ NUEVO: Constantes útiles
export const WEEK_TYPE_LABELS: Record<WeekType, string> = {
  REGULAR: 'Semana Regular',
  EVALUATION: 'Semana de Evaluación',
  REVIEW: 'Semana de Repaso',
};

export const WEEK_TYPE_COLORS: Record<WeekType, string> = {
  REGULAR: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  EVALUATION: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  REVIEW: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
};

export const MAX_REGULAR_WEEKS = 8;
export const EVALUATION_WEEK_NUMBER = 9;