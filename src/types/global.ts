// src/types/global.ts

/**
 * ============================================
 * TIPOS PARA CURSOS Y ESTUDIANTES
 * ============================================
 */

// ============================================
// TIPOS BASE
// ============================================

export interface Course {
  id: number;
  code: string;
  name: string;
  area?: string;
  color?: string;
  isActive: boolean;
}

export interface Teacher {
  id: number;
  givenNames: string;
  lastNames: string;
}

export interface Grade {
  id: number;
  name: string;
  level: string;
  order: number;
}

export interface Section {
  id: number;
  name: string;
  capacity: number;
  gradeId: number;
}

export interface Student {
  id: number;
  codeSIRE: string;
  givenNames: string;
  lastNames: string;
  gender?: string;
  birthDate?: string;
}

export interface StudentWithPicture extends Student {
  pictures?: Array<{
    url: string;
    kind: string;
  }>;
}

// ============================================
// ENROLLMENT Y MATRICULAS
// ============================================

export interface Enrollment {
  id: number;
  status: string;
  dateEnrolled: string;
}

export interface StudentGrade {
  id: number;
  value: number;
  comments?: string;
  course: Course;
  bimester: {
    id: number;
    number: number;
    name: string;
  };
}

export interface StudentWithGrades {
  enrollment: Enrollment;
  student: StudentWithPicture;
  grades: StudentGrade[];
  parents?: Array<{
    parent: Teacher;
  }>;
}

// ============================================
// ASISTENCIA
// ============================================

export interface AttendanceRecord {
  id: number;
  date: string;
  statusCode: string;
  minutesLate?: number;
  hasJustification: boolean;
  notes?: string;
}

export interface AttendanceReport {
  id: number;
  countPresent: number;
  countAbsent: number;
  countAbsentJustified: number;
  countTemporal: number;
  countTemporalJustified: number;
  totalSchoolDays: number;
  totalMarkDays: number;
  attendancePercentage: number;
  absencePercentage: number;
  consecutiveAbsences: number;
  isAtRisk: boolean;
  needsIntervention: boolean;
  notes?: string;
  calculatedAt: string;
  lastRecalculatedAt: string;
}

export interface AttendanceCount {
  total: number;
  present: number;
  absent: number;
  justified: number;
}

export interface StudentWithAttendance {
  enrollment: Enrollment;
  student: Student;
  attendanceReport: AttendanceReport | null;
  attendances: AttendanceRecord[];
  attendanceCount: AttendanceCount;
}

// ============================================
// CURSOS ASIGNADOS
// ============================================

export interface CourseAssignment {
  id: number;
  type: string;
}

export interface TeacherCourse {
  courseAssignment: CourseAssignment;
  course: Course;
  section: {
    id: number;
    name: string;
    grade: Grade;
  };
  students: Student[];
  studentCount: number;
}

// ============================================
// ESTRUCTURA CICLO
// ============================================

export interface GradeCycle {
  gradeId: number;
  grade: {
    id: number;
    name: string;
    level: string;
    sections: Section[];
  };
}

export interface ActiveCycleStructure {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  grades: Array<{
    gradeId: number;
    grade: {
      id: number;
      name: string;
      level: string;
      sections: Array<{
        id: number;
        name: string;
        capacity: number;
        courseAssignments: Array<{
          id: number;
          course: Course;
          teacher: Teacher;
        }>;
      }>;
    };
  }>;
}

export interface FullCycleStructure {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  grades: Array<{
    gradeId: number;
    grade: {
      id: number;
      name: string;
      level: string;
      sections: Array<{
        id: number;
        name: string;
        capacity: number;
        enrollments: Array<{
          id: number;
          student: Student;
        }>;
      }>;
    };
  }>;
}

// ============================================
// RESPUESTAS API
// ============================================

export interface CoursesApiResponse<T> {
  data: T;
  message?: string;
  timestamp?: string;
}

export type ActiveCycleResponse = CoursesApiResponse<ActiveCycleStructure>;
export type StudentListResponse = CoursesApiResponse<StudentWithGrades[]>;
export type StudentLiteListResponse = CoursesApiResponse<Array<{ id: number; student: Student }>>;
export type StudentAttendanceListResponse = CoursesApiResponse<StudentWithAttendance[]>;
export type TeacherCoursesResponse = CoursesApiResponse<TeacherCourse[]>;
export type FullCycleResponse = CoursesApiResponse<FullCycleStructure>;