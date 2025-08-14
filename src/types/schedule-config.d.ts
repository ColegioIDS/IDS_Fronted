// types/schedule-config.d.ts

/* Tipo para los break slots */
export interface BreakSlot {
  start: string; // Formato HH:MM (ej: "09:00")
  end: string;   // Formato HH:MM (ej: "09:15")
  label?: string; // Opcional (ej: "Recreo mañana")
}

/* Tipo principal para la configuración */
export interface ScheduleConfig {
  id: number;
  sectionId: number;
  workingDays: number[]; // [0-6] donde 0=domingo, 6=sábado
  startTime: string;     // HH:MM
  endTime: string;      // HH:MM
  classDuration: number; // en minutos (ej: 45)
  breakSlots: BreakSlot[];
  createdAt: string;    // ISO date string
  updatedAt: string;    // ISO date string
}

/* Tipos para las requests */
export interface CreateScheduleConfigDto {
  sectionId: number;
  workingDays: number[];
  startTime: string;
  endTime: string;
  classDuration: number;
  breakSlots?: BreakSlot[];
}

export interface UpdateScheduleConfigDto {
  sectionId?: number;
  workingDays?: number[];
  startTime?: string;
  endTime?: string;
  classDuration?: number;
  breakSlots?: BreakSlot[];
}