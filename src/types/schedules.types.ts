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

// Constantes
export const TIME_SLOTS: TimeSlot[] = [
  { start: "07:00", end: "07:45", label: "07:00 - 07:45" },
  { start: "07:45", end: "08:30", label: "07:45 - 08:30" },
  { start: "08:30", end: "09:15", label: "08:30 - 09:15" },
  { start: "09:15", end: "10:00", label: "09:15 - 10:00" },
  { start: "10:00", end: "10:15", label: "RECREO" },
  { start: "10:15", end: "11:00", label: "10:15 - 11:00" },
  { start: "11:00", end: "11:45", label: "11:00 - 11:45" },
  { start: "11:45", end: "12:30", label: "11:45 - 12:30" },
  { start: "12:30", end: "13:15", label: "12:30 - 13:15" },
  { start: "13:15", end: "14:00", label: "ALMUERZO" },
  { start: "14:00", end: "14:45", label: "14:00 - 14:45" },
  { start: "14:45", end: "15:30", label: "14:45 - 15:30" },
  { start: "15:30", end: "16:15", label: "15:30 - 16:15" },
  { start: "16:15", end: "17:00", label: "16:15 - 17:00" },
];

export const DAYS_OF_WEEK = [
  { value: 1, label: "Lunes", shortLabel: "Lun" },
  { value: 2, label: "Martes", shortLabel: "Mar" },
  { value: 3, label: "Miércoles", shortLabel: "Mié" },
  { value: 4, label: "Jueves", shortLabel: "Jue" },
  { value: 5, label: "Viernes", shortLabel: "Vie" },
  { value: 6, label: "Sábado", shortLabel: "Sáb" },
  { value: 7, label: "Domingo", shortLabel: "Dom" },
];