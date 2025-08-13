// src/types/schedules.ts
export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7; 

export interface Schedule {
  id: number;
  sectionId: number;
  courseId: number;
  teacherId: number | null;
  dayOfWeek: DayOfWeek;
  startTime: string; // Formato HH:MM
  endTime: string;   // Formato HH:MM
  classroom: string | null;
  
  // Relaciones (opcional, depende si las necesitas en front)
  section?: {
    id: number;
    name: string;
  };
  course?: {
    id: number;
    name: string;
  };
  teacher?: {
    id: number;
    name: string;
  } | null;
}

// Tipo para crear/editar un horario (sin ID ni campos autogenerados)
export interface ScheduleFormValues {
  sectionId: number;
  courseId: number;
  teacherId: number | null;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  classroom?: string; // Hacerlo opcional
}