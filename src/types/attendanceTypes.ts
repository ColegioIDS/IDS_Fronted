/**
 * src/types/attendance.ts
 * 
 * Tipos y constantes para el sistema de asistencia
 */

export type AttendanceStatus = "present" | "absent" | "late" | "pending";

export interface AttendanceRecord {
  studentId: number;
  courseId: number;
  status: AttendanceStatus;
}

export interface Section {
  id: number;
  name: string;
  students: Student[];
  courses: Course[];
}

export interface Student {
  id: number;
  codeSIRE: string;
  givenNames: string;
  lastNames: string;
  gender?: string;
  birthDate?: string;
}

export interface Course {
  id: number;
  code: string;
  name: string;
  area?: string;
  color?: string;
  isActive: boolean;
}

export const ATTENDANCE_STATUSES = [
  {
    value: "present" as const,
    label: "Presente",
    icon: "✓",
    className: "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950 dark:text-green-300 dark:hover:bg-green-900",
    badgeClassName: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  {
    value: "absent" as const,
    label: "Ausente",
    icon: "✗",
    className: "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900",
    badgeClassName: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  },
  {
    value: "late" as const,
    label: "Tardío",
    icon: "⏰",
    className: "bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-950 dark:text-yellow-300 dark:hover:bg-yellow-900",
    badgeClassName: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  },
  {
    value: "pending" as const,
    label: "Pendiente",
    icon: "?",
    className: "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700",
    badgeClassName: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  },
];

export const STATUS_MAPPING: Record<string, string | null> = {
  present: "P",
  absent: "I",
  late: "TI",
  pending: null,
};