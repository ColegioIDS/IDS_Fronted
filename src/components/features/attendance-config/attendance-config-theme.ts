// src/components/features/attendance-config/attendance-config-theme.ts

/**
 * Sistema de temas específico para AttendanceConfig
 * Colores suaves y refinados, minimalista
 */

export const ATTENDANCE_CONFIG_THEME = {
  // Operaciones CRUD
  operations: {
    read: {
      bg: 'bg-white dark:bg-slate-900',
      border: 'border-slate-200 dark:border-slate-700',
      text: 'text-slate-900 dark:text-slate-100',
      button: 'bg-slate-600 hover:bg-slate-700 dark:bg-slate-600 dark:hover:bg-slate-700',
      badge: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200',
    },
    update: {
      bg: 'bg-white dark:bg-slate-900',
      border: 'border-slate-200 dark:border-slate-700',
      text: 'text-slate-900 dark:text-slate-100',
      button: 'bg-slate-600 hover:bg-slate-700 dark:bg-slate-600 dark:hover:bg-slate-700',
      badge: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200',
    },
    create: {
      bg: 'bg-white dark:bg-slate-900',
      border: 'border-slate-200 dark:border-slate-700',
      text: 'text-slate-900 dark:text-slate-100',
      button: 'bg-slate-600 hover:bg-slate-700 dark:bg-slate-600 dark:hover:bg-slate-700',
      badge: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200',
    },
    reset: {
      bg: 'bg-white dark:bg-slate-900',
      border: 'border-slate-200 dark:border-slate-700',
      text: 'text-slate-900 dark:text-slate-100',
      button: 'bg-slate-600 hover:bg-slate-700 dark:bg-slate-600 dark:hover:bg-slate-700',
      badge: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200',
    },
    delete: {
      bg: 'bg-white dark:bg-slate-900',
      border: 'border-slate-200 dark:border-slate-700',
      text: 'text-slate-900 dark:text-slate-100',
      button: 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800',
      badge: 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300',
    },
  },

  // Secciones de configuración
  sections: {
    threshold: {
      bg: 'bg-white dark:bg-slate-900',
      border: 'border-slate-200 dark:border-slate-700',
      text: 'text-slate-900 dark:text-slate-100',
      icon: 'text-slate-600 dark:text-slate-400',
      badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    },
    timing: {
      bg: 'bg-white dark:bg-slate-900',
      border: 'border-slate-200 dark:border-slate-700',
      text: 'text-slate-900 dark:text-slate-100',
      icon: 'text-slate-600 dark:text-slate-400',
      badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    },
    justification: {
      bg: 'bg-white dark:bg-slate-900',
      border: 'border-slate-200 dark:border-slate-700',
      text: 'text-slate-900 dark:text-slate-100',
      icon: 'text-slate-600 dark:text-slate-400',
      badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    },
    approval: {
      bg: 'bg-white dark:bg-slate-900',
      border: 'border-slate-200 dark:border-slate-700',
      text: 'text-slate-900 dark:text-slate-100',
      icon: 'text-slate-600 dark:text-slate-400',
      badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    },
  },

  // Base
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

  // Estados
  status: {
    active: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      text: 'text-emerald-700 dark:text-emerald-300',
      dot: 'bg-emerald-500',
    },
    inactive: {
      bg: 'bg-slate-100 dark:bg-slate-800',
      text: 'text-slate-700 dark:text-slate-300',
      dot: 'bg-slate-400',
    },
  },

  // Validaciones
  validation: {
    error: {
      bg: 'bg-red-50 dark:bg-red-950/30',
      border: 'border-red-200 dark:border-red-800/50',
      text: 'text-red-700 dark:text-red-300',
      icon: 'text-red-600 dark:text-red-400',
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      border: 'border-amber-200 dark:border-amber-800/50',
      text: 'text-amber-700 dark:text-amber-300',
      icon: 'text-amber-600 dark:text-amber-400',
    },
    success: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      border: 'border-emerald-200 dark:border-emerald-800/50',
      text: 'text-emerald-700 dark:text-emerald-300',
      icon: 'text-emerald-600 dark:text-emerald-400',
    },
    info: {
      bg: 'bg-white dark:bg-slate-900',
      border: 'border-slate-200 dark:border-slate-700',
      text: 'text-slate-700 dark:text-slate-300',
      icon: 'text-slate-600 dark:text-slate-400',
    },
  },
};
