// src/constants/attendance-statuses-theme.ts
/**
 * Sistema centralizado de temas y colores para módulo de Attendance Statuses
 * Fácil de modificar y mantener consistencia en toda la aplicación
 */

export const ATTENDANCE_THEME = {
  // Paleta de colores para diferentes operaciones
  operations: {
    create: {
      bg: 'bg-emerald-50 dark:bg-emerald-950',
      border: 'border-emerald-200 dark:border-emerald-800',
      text: 'text-emerald-900 dark:text-emerald-100',
      button: 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700',
      muted: 'text-emerald-700 dark:text-emerald-300',
      badge: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200',
    },
    read: {
      bg: 'bg-blue-50 dark:bg-blue-950',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-900 dark:text-blue-100',
      button: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700',
      muted: 'text-blue-700 dark:text-blue-300',
      badge: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    },
    update: {
      bg: 'bg-amber-50 dark:bg-amber-950',
      border: 'border-amber-200 dark:border-amber-800',
      text: 'text-amber-900 dark:text-amber-100',
      button: 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700',
      muted: 'text-amber-700 dark:text-amber-300',
      badge: 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200',
    },
    delete: {
      bg: 'bg-red-50 dark:bg-red-950',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-900 dark:text-red-100',
      button: 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700',
      muted: 'text-red-700 dark:text-red-300',
      badge: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
    },
  },

  // Colores base para la interfaz
  base: {
    bg: {
      primary: 'bg-white dark:bg-slate-900',
      secondary: 'bg-slate-50 dark:bg-slate-800',
      tertiary: 'bg-slate-100 dark:bg-slate-700',
      hover: 'hover:bg-slate-50 dark:hover:bg-slate-800',
    },
    border: {
      light: 'border-slate-200 dark:border-slate-700',
      DEFAULT: 'border-slate-300 dark:border-slate-600',
      dark: 'border-slate-400 dark:border-slate-500',
    },
    text: {
      primary: 'text-slate-900 dark:text-slate-100',
      secondary: 'text-slate-700 dark:text-slate-300',
      muted: 'text-slate-600 dark:text-slate-400',
      disabled: 'text-slate-500 dark:text-slate-500',
    },
  },

  // Estados específicos
  status: {
    active: {
      bg: 'bg-green-100 dark:bg-green-900',
      text: 'text-green-800 dark:text-green-200',
      dot: 'bg-green-500',
    },
    inactive: {
      bg: 'bg-red-100 dark:bg-red-900',
      text: 'text-red-800 dark:text-red-200',
      dot: 'bg-red-500',
    },
    pending: {
      bg: 'bg-yellow-100 dark:bg-yellow-900',
      text: 'text-yellow-800 dark:text-yellow-200',
      dot: 'bg-yellow-500',
    },
  },

  // Tipos de asistencia
  attendanceType: {
    present: {
      icon: 'Check',
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-950',
    },
    absent: {
      icon: 'X',
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-950',
    },
    temporal: {
      icon: 'Clock',
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-950',
    },
    excused: {
      icon: 'CheckCircle2',
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950',
    },
  },

  // Espaciado y dimensiones
  spacing: {
    card: {
      padding: 'p-4',
      compact: 'p-3',
      large: 'p-6',
    },
    gap: {
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-3',
      lg: 'gap-4',
    },
  },

  // Radio y bordes
  radius: {
    sm: 'rounded',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    full: 'rounded-full',
  },

  // Transiciones
  transition: {
    fast: 'transition-colors duration-200',
    normal: 'transition-all duration-300',
    slow: 'transition-all duration-500',
  },
} as const;

export const getStatusTypeStyle = (
  isNegative: boolean,
  isExcused: boolean,
  isTemporal: boolean
) => {
  if (isExcused) return ATTENDANCE_THEME.attendanceType.excused;
  if (isNegative) return ATTENDANCE_THEME.attendanceType.absent;
  if (isTemporal) return ATTENDANCE_THEME.attendanceType.temporal;
  return ATTENDANCE_THEME.attendanceType.present;
};