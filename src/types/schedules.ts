// src/types/schedules.ts

export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7; 

// ==================== TIPOS BÁSICOS ====================

export interface Schedule {
  id: number;
  sectionId: number;
  courseId: number;
  teacherId: number | null;
  dayOfWeek: DayOfWeek;
  startTime: string; // Formato HH:MM
  endTime: string;   // Formato HH:MM
  classroom: string | null;
  
  // Relaciones
  section?: {
    id: number;
    name: string;
    grade?: {
      id: number;
      name: string;
    };
  };
  course?: {
    id: number;
    name: string;
    code?: string;
    color?: string;
  };
  teacher?: {
    id: number;
    givenNames: string;
    lastNames: string;
    email?: string;
  } | null;
}

export interface ScheduleFormValues {
  sectionId: number;
  courseId: number;
  teacherId?: number | null;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  classroom?: string;
}

// ==================== NUEVOS TIPOS CONSOLIDADOS ====================

export interface Grade {
  id: number;
  name: string;
  level: string;
  order: number;
  sections: Section[];
  courses: Course[];
}

export interface Section {
  id: number;
  name: string;
  capacity: number;
  gradeId: number;
  teacherId: number | null;
  teacher: Teacher | null;
}

export interface Course {
  id: number;
  code: string;
  name: string;
  area: string | null;
  color: string | null;
  isCore: boolean;
}

export interface Teacher {
  id: number;
  givenNames: string;
  lastNames: string;
  fullName: string;
  email: string;
  sections: {
    id: number;
    name: string;
    gradeId: number;
    gradeName: string;
    gradeLevel: string;
  }[];
}

export interface ScheduleConfig {
  id: number;
  sectionId: number;
  sectionName: string;
  gradeName: string;
  startTime: string;
  endTime: string;
  classDuration: number;
  workingDays: any; // JsonValue
  breakSlots: any;  // JsonValue
}

export interface SchoolCycle {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

// ✅ NUEVO: Datos consolidados del formulario
export interface ScheduleFormData {
  activeCycle: SchoolCycle;
  grades: Grade[];
  scheduleConfigs: ScheduleConfig[];
  teachers: Teacher[];
  schedules: {
    id: number;
    sectionId: number;
    sectionName: string;
    gradeId: number;
    gradeName: string;
    courseId: number;
    courseName: string;
    courseColor: string | null;
    teacherId: number | null;
    teacherName: string | null;
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
    classroom: string | null;
  }[];
}

// ✅ NUEVO: Disponibilidad de maestros
export interface TeacherAvailability {
  [teacherId: number]: {
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
  }[];
}