// src/components/features/attendance-config/attendance-config-theme.ts

/**
 * Sistema de temas específico para AttendanceConfig
 * Colores bonitos consistentes con el módulo de attendance
 */

export const ATTENDANCE_CONFIG_THEME = {
  // Operaciones CRUD
  operations: {
    read: {
      bg: 'bg-indigo-50 dark:bg-indigo-950',
      border: 'border-indigo-200 dark:border-indigo-800',
      text: 'text-indigo-900 dark:text-indigo-100',
      button: 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700',
      badge: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200',
    },
    update: {
      bg: 'bg-amber-50 dark:bg-amber-950',
      border: 'border-amber-200 dark:border-amber-800',
      text: 'text-amber-900 dark:text-amber-100',
      button: 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700',
      badge: 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200',
    },
    create: {
      bg: 'bg-emerald-50 dark:bg-emerald-950',
      border: 'border-emerald-200 dark:border-emerald-800',
      text: 'text-emerald-900 dark:text-emerald-100',
      button: 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700',
      badge: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200',
    },
    reset: {
      bg: 'bg-cyan-50 dark:bg-cyan-950',
      border: 'border-cyan-200 dark:border-cyan-800',
      text: 'text-cyan-900 dark:text-cyan-100',
      button: 'bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-600 dark:hover:bg-cyan-700',
      badge: 'bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200',
    },
    delete: {
      bg: 'bg-red-50 dark:bg-red-950',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-900 dark:text-red-100',
      button: 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700',
      badge: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
    },
  },

  // Secciones de configuración
  sections: {
    threshold: {
      bg: 'bg-rose-50 dark:bg-rose-950',
      border: 'border-rose-200 dark:border-rose-800',
      text: 'text-rose-900 dark:text-rose-100',
      icon: 'text-rose-600 dark:text-rose-400',
      badge: 'bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200',
    },
    timing: {
      bg: 'bg-orange-50 dark:bg-orange-950',
      border: 'border-orange-200 dark:border-orange-800',
      text: 'text-orange-900 dark:text-orange-100',
      icon: 'text-orange-600 dark:text-orange-400',
      badge: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
    },
    justification: {
      bg: 'bg-purple-50 dark:bg-purple-950',
      border: 'border-purple-200 dark:border-purple-800',
      text: 'text-purple-900 dark:text-purple-100',
      icon: 'text-purple-600 dark:text-purple-400',
      badge: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
    },
    approval: {
      bg: 'bg-teal-50 dark:bg-teal-950',
      border: 'border-teal-200 dark:border-teal-800',
      text: 'text-teal-900 dark:text-teal-100',
      icon: 'text-teal-600 dark:text-teal-400',
      badge: 'bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200',
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
      bg: 'bg-green-100 dark:bg-green-900',
      text: 'text-green-800 dark:text-green-200',
      dot: 'bg-green-500',
    },
    inactive: {
      bg: 'bg-red-100 dark:bg-red-900',
      text: 'text-red-800 dark:text-red-200',
      dot: 'bg-red-500',
    },
  },

  // Validaciones
  validation: {
    error: {
      bg: 'bg-red-50 dark:bg-red-950',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-700 dark:text-red-300',
      icon: 'text-red-600 dark:text-red-400',
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-950',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-700 dark:text-yellow-300',
      icon: 'text-yellow-600 dark:text-yellow-400',
    },
    success: {
      bg: 'bg-green-50 dark:bg-green-950',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-700 dark:text-green-300',
      icon: 'text-green-600 dark:text-green-400',
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-950',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-700 dark:text-blue-300',
      icon: 'text-blue-600 dark:text-blue-400',
    },
  },
};
