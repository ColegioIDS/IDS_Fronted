// types/schedules.types.ts
import type { Schedule, DayOfWeek, ScheduleFormValues } from "@/types/schedules";
import type { User as Teacher } from "@/types/user";
import type { Course } from "@/types/courses";

// Tipos para drag and drop
export interface DragItem {
  id: number;
  type: 'course' | 'teacher' | 'schedule';
  name: string;
  data?: Course | Teacher | Schedule | TempSchedule;
}

export interface TimeSlot {
  start: string;
  end: string;
  label: string;
  isBreak?: boolean; // Para identificar recreos/almuerzos
}

// NUEVOS TIPOS PARA CONFIGURACIÓN DINÁMICA
export interface ScheduleConfig {
  id?: number;
  sectionId: number;
  workingDays: number[]; // Array de días (1=Lunes, 2=Martes, etc.)
  startTime: string; // Hora de inicio "07:00"
  endTime: string; // Hora de fin "17:00"
  classDuration: number; // Duración en minutos (45, 50, 60, etc.)
  breakSlots: BreakSlot[]; // Recreos y almuerzos
  createdAt?: string;
  updatedAt?: string;
}

export interface BreakSlot {
  start: string;
  end: string;
  label: string; // "RECREO", "ALMUERZO", etc.
}

// Utilidad para generar time slots dinámicamente
export interface TimeSlotGenerator {
  startTime: string;
  endTime: string;
  classDuration: number;
  breakSlots: BreakSlot[];
}

// Tipo para horarios temporales - Corregido
export interface TempSchedule extends Omit<Schedule, 'id' | 'createdAt' | 'updatedAt' | 'courseId' | 'teacherId' | 'course' | 'teacher'> {
  id: string; // ID temporal como string
  isTemp: true;
  createdAt?: string;
  updatedAt?: string;
  // Override de propiedades para permitir null
  courseId: number | null;
  teacherId: number | null;
  classroom: string | null;
  course?: {
    id: number;
    name: string;
  } | null;
  teacher?: {
    id: number;
    name: string;
  } | null;
}

export interface ScheduleChange {
  action: 'create' | 'update' | 'delete';
  schedule: TempSchedule | Schedule;
  originalSchedule?: Schedule;
}

// Estado global para drag & drop
export interface DragState {
  isDragging: boolean;
  dragItem: DragItem | null;
  dragElement: HTMLElement | null;
  startPosition: { x: number; y: number };
}

// CONSTANTES EXPORTADAS COMO VALORES (no tipos)
export const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  { start: "07:00", end: "07:45", label: "07:00 - 07:45" },
  { start: "07:45", end: "08:30", label: "07:45 - 08:30" },
  { start: "08:30", end: "09:15", label: "08:30 - 09:15" },
  { start: "09:15", end: "10:00", label: "09:15 - 10:00" },
  { start: "10:00", end: "10:15", label: "RECREO", isBreak: true },
  { start: "10:15", end: "11:00", label: "10:15 - 11:00" },
  { start: "11:00", end: "11:45", label: "11:00 - 11:45" },
  { start: "11:45", end: "12:30", label: "11:45 - 12:30" },
  { start: "12:30", end: "13:15", label: "12:30 - 13:15" },
  { start: "13:15", end: "14:00", label: "ALMUERZO", isBreak: true },
  { start: "14:00", end: "14:45", label: "14:00 - 14:45" },
  { start: "14:45", end: "15:30", label: "14:45 - 15:30" },
  { start: "15:30", end: "16:15", label: "15:30 - 16:15" },
  { start: "16:15", end: "17:00", label: "16:15 - 17:00" },
];

export const ALL_DAYS_OF_WEEK = [
  { value: 1, label: "Lunes", shortLabel: "Lun" },
  { value: 2, label: "Martes", shortLabel: "Mar" },
  { value: 3, label: "Miércoles", shortLabel: "Mié" },
  { value: 4, label: "Jueves", shortLabel: "Jue" },
  { value: 5, label: "Viernes", shortLabel: "Vie" },
  { value: 6, label: "Sábado", shortLabel: "Sáb" },
  { value: 7, label: "Domingo", shortLabel: "Dom" },
];

// FUNCIONES UTILITARIAS EXPORTADAS COMO CLASE
export class ScheduleTimeGenerator {
  static generateTimeSlots(config: TimeSlotGenerator): TimeSlot[] {
    const slots: TimeSlot[] = [];
    let currentTime = this.parseTime(config.startTime);
    const endTime = this.parseTime(config.endTime);
    
    while (currentTime < endTime) {
      const slotEnd = new Date(currentTime.getTime() + config.classDuration * 60000);
      
      // Verificar si hay un break slot en este rango
      const breakSlot = config.breakSlots.find(breakSlot => {
        const breakStart = this.parseTime(breakSlot.start);
        return Math.abs(currentTime.getTime() - breakStart.getTime()) < 60000; // 1 minuto de tolerancia
      });
      
      if (breakSlot) {
        // Agregar el break
        slots.push({
          start: breakSlot.start,
          end: breakSlot.end,
          label: breakSlot.label,
          isBreak: true
        });
        currentTime = this.parseTime(breakSlot.end);
      } else {
        // Agregar clase normal
        const startStr = this.formatTime(currentTime);
        const endStr = this.formatTime(slotEnd);
        
        slots.push({
          start: startStr,
          end: endStr,
          label: `${startStr} - ${endStr}`
        });
        
        currentTime = slotEnd;
      }
      
      // Prevenir bucle infinito
      if (slots.length > 20) break;
    }
    
    return slots;
  }
  
  private static parseTime(timeStr: string): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }
  
  private static formatTime(date: Date): string {
    return date.toTimeString().slice(0, 5);
  }
}

// CONFIGURACIONES PREDEFINIDAS - Actualizadas para formato [1-7] (display)
export const PRESET_CONFIGS = {
  STANDARD_WEEK: {
    workingDays: [1, 2, 3, 4, 5], // Lunes a Viernes (formato display)
    startTime: "07:00",
    endTime: "17:00",
    classDuration: 45,
    breakSlots: [
      { start: "10:00", end: "10:15", label: "RECREO" },
      { start: "13:15", end: "14:00", label: "ALMUERZO" }
    ]
  },
  EXTENDED_WEEK: {
    workingDays: [1, 2, 3, 4, 5, 6], // Lunes a Sábado (formato display)
    startTime: "07:00",
    endTime: "15:00",
    classDuration: 50,
    breakSlots: [
      { start: "09:40", end: "09:55", label: "RECREO" },
      { start: "12:30", end: "13:15", label: "ALMUERZO" }
    ]
  },
  INTENSIVE: {
    workingDays: [1, 2, 3, 4, 5], // Lunes a Viernes (formato display)
    startTime: "08:00",
    endTime: "18:00",
    classDuration: 60,
    breakSlots: [
      { start: "10:00", end: "10:15", label: "RECREO" },
      { start: "12:00", end: "13:00", label: "ALMUERZO" },
      { start: "15:00", end: "15:15", label: "RECREO" }
    ]
  }
} as const;