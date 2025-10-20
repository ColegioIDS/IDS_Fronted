// src/constants/attendanceStatuses.ts

import {
  CheckCircle2,
  AlertCircle,
  Clock,
  CheckCheck,
  XCircle,
} from 'lucide-react';

export interface AttendanceStatus {
  code: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  // Light mode
  lightBg: string;
  lightText: string;
  lightBorder: string;
  // Dark mode
  darkBg: string;
  darkText: string;
  darkBorder: string;
  // Badge
  badgeLight: string;
  badgeDark: string;
}

export const ATTENDANCE_STATUSES: Record<string, AttendanceStatus> = {
  P: {
    code: 'P',
    name: 'Presente',
    description: 'Estudiante presente en clase',
    icon: CheckCircle2,
    lightBg: 'bg-green-50',
    lightText: 'text-green-700',
    lightBorder: 'border-green-200',
    darkBg: 'dark:bg-green-950',
    darkText: 'dark:text-green-200',
    darkBorder: 'dark:border-green-800',
    badgeLight: 'bg-green-100 text-green-800',
    badgeDark: 'dark:bg-green-900 dark:text-green-100',
  },
  I: {
    code: 'I',
    name: 'Inasistencia',
    description: 'Inasistencia sin justificar',
    icon: XCircle,
    lightBg: 'bg-red-50',
    lightText: 'text-red-700',
    lightBorder: 'border-red-200',
    darkBg: 'dark:bg-red-950',
    darkText: 'dark:text-red-200',
    darkBorder: 'dark:border-red-800',
    badgeLight: 'bg-red-100 text-red-800',
    badgeDark: 'dark:bg-red-900 dark:text-red-100',
  },
  IJ: {
    code: 'IJ',
    name: 'Inasistencia Justificada',
    description: 'Inasistencia con justificación aprobada',
    icon: CheckCheck,
    lightBg: 'bg-amber-50',
    lightText: 'text-amber-700',
    lightBorder: 'border-amber-200',
    darkBg: 'dark:bg-amber-950',
    darkText: 'dark:text-amber-200',
    darkBorder: 'dark:border-amber-800',
    badgeLight: 'bg-amber-100 text-amber-800',
    badgeDark: 'dark:bg-amber-900 dark:text-amber-100',
  },
  TI: {
    code: 'TI',
    name: 'Tardanza',
    description: 'Llegada tarde sin justificar',
    icon: Clock,
    lightBg: 'bg-yellow-50',
    lightText: 'text-yellow-700',
    lightBorder: 'border-yellow-200',
    darkBg: 'dark:bg-yellow-950',
    darkText: 'dark:text-yellow-200',
    darkBorder: 'dark:border-yellow-800',
    badgeLight: 'bg-yellow-100 text-yellow-800',
    badgeDark: 'dark:bg-yellow-900 dark:text-yellow-100',
  },
  TJ: {
    code: 'TJ',
    name: 'Tardanza Justificada',
    description: 'Llegada tarde con justificación',
    icon: Clock,
    lightBg: 'bg-blue-50',
    lightText: 'text-blue-700',
    lightBorder: 'border-blue-200',
    darkBg: 'dark:bg-blue-950',
    darkText: 'dark:text-blue-200',
    darkBorder: 'dark:border-blue-800',
    badgeLight: 'bg-blue-100 text-blue-800',
    badgeDark: 'dark:bg-blue-900 dark:text-blue-100',
  },
};

/**
 * Obtener el status por código
 */
export const getStatusByCode = (code: string): AttendanceStatus | undefined => {
  return ATTENDANCE_STATUSES[code];
};

/**
 * Obtener todas las opciones de status para botones
 */
export const getStatusOptions = (): AttendanceStatus[] => {
  return Object.values(ATTENDANCE_STATUSES);
};

/**
 * Colores para porcentaje de asistencia
 */
export const getAttendancePercentageColor = (percentage: number) => {
  if (percentage >= 90) {
    return {
      light: 'bg-green-100 text-green-800',
      dark: 'dark:bg-green-900 dark:text-green-100',
      bar: 'bg-green-500',
    };
  }
  if (percentage >= 75) {
    return {
      light: 'bg-yellow-100 text-yellow-800',
      dark: 'dark:bg-yellow-900 dark:text-yellow-100',
      bar: 'bg-yellow-500',
    };
  }
  return {
    light: 'bg-red-100 text-red-800',
    dark: 'dark:bg-red-900 dark:text-red-100',
    bar: 'bg-red-500',
  };
};

/**
 * Colores para tarjetas de estadísticas
 */
export const STAT_COLORS = {
  total: {
    light: 'bg-blue-50',
    dark: 'dark:bg-blue-950',
    text: 'text-blue-700 dark:text-blue-200',
    accent: 'text-blue-600 dark:text-blue-300',
  },
  average: {
    light: 'bg-green-50',
    dark: 'dark:bg-green-950',
    text: 'text-green-700 dark:text-green-200',
    accent: 'text-green-600 dark:text-green-300',
  },
  risk: {
    light: 'bg-red-50',
    dark: 'dark:bg-red-950',
    text: 'text-red-700 dark:text-red-200',
    accent: 'text-red-600 dark:text-red-300',
  },
  intervention: {
    light: 'bg-orange-50',
    dark: 'dark:bg-orange-950',
    text: 'text-orange-700 dark:text-orange-200',
    accent: 'text-orange-600 dark:text-orange-300',
  },
  highest: {
    light: 'bg-emerald-50',
    dark: 'dark:bg-emerald-950',
    text: 'text-emerald-700 dark:text-emerald-200',
    accent: 'text-emerald-600 dark:text-emerald-300',
  },
  lowest: {
    light: 'bg-rose-50',
    dark: 'dark:bg-rose-950',
    text: 'text-rose-700 dark:text-rose-200',
    accent: 'text-rose-600 dark:text-rose-300',
  },
};