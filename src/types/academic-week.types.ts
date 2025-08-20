// types/academic-weeks.ts

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
  bimester?: BimesterInfo;
}

// Tipo para crear/editar una semana académica (sin ID ni campos autogenerados)
export interface AcademicWeekFormValues {
  bimesterId: number;
  number: number;
  startDate: string;
  endDate: string;
  objectives?: string;
}

// Tipo para actualización parcial
export interface UpdateAcademicWeekFormValues {
  bimesterId?: number;
  number?: number;
  startDate?: string;
  endDate?: string;
  objectives?: string;
}

// Tipo para filtros
export interface AcademicWeekFilters {
  bimesterId?: number;
  number?: number;
  status?: 'completed' | 'active' | 'upcoming'; // AGREGAR
  hasObjectives?: boolean; // AGREGAR
}


// Tipo para generar semanas automáticamente
export interface GenerateWeeksRequest {
  weeksCount?: number;
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
  bimester?: BimesterInfo;
}

// Tipo para parámetros de consulta
export interface AcademicWeekQueryParams {
  bimesterId?: number;
  number?: number;
}