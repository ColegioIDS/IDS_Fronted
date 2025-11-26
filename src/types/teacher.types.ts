// src/types/teacher.types.ts
import { User } from '@/types/users.types';

// Extender el tipo User para incluir propiedades específicas de profesores
export interface Teacher extends User {
  guidedSections?: Section[];
  assignedSchedules?: Schedule[];
}

export interface Section {
  id: number;
  name: string;
  capacity: number;
  gradeId: number;
  teacherId?: number;
  grade?: Grade;
}

export interface Schedule {
  id: number;
  sectionId: number;
  courseId: number;
  teacherId?: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  classroom?: string;
}

export interface Grade {
  id: number;
  name: string;
  level: string;
  order: number;
  isActive: boolean;
}

export interface TeacherAvailabilityResponse {
  available: Teacher[];
  assigned: Teacher[];
  current?: Teacher;
  stats: {
    total: number;
    available: number;
    assigned: number;
  };
}

export interface TeacherWorkload {
  teacher: Teacher;
  sections: Section[];
  schedules: Schedule[];
  totalHours: number;
  workloadPercentage: number;
}

export interface TeacherStats {
  total: number;
  available: number;
  assigned: number;
  workloadDistribution: {
    teacherId: number;
    teacherName: string;
    sectionsCount: number;
    hoursCount: number;
    workloadPercentage: number;
  }[];
}

export interface TeacherFilters {
  available?: boolean;
  excludeSectionId?: number;
  gradeId?: number;
  hasSection?: boolean;
  isHomeroomTeacher?: boolean;
}

// Request types
export interface AssignTeacherRequest {
  teacherId: number;
  sectionId: number;
}

export interface RemoveTeacherRequest {
  sectionId: number;
}