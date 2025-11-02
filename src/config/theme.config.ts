// src/config/theme.config.ts

export const APP_THEME = {
  // 🎨 COLORES PRINCIPALES
  colors: {
    // Brand colors
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',  // Main
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    secondary: {
      50: '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa',
      500: '#8b5cf6',  // Main
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
    },
    
    // Semantic colors
    success: {
      light: '#d1fae5',
      main: '#10b981',
      dark: '#047857',
      text: '#065f46',
    },
    warning: {
      light: '#fef3c7',
      main: '#f59e0b',
      dark: '#d97706',
      text: '#92400e',
    },
    error: {
      light: '#fee2e2',
      main: '#ef4444',
      dark: '#dc2626',
      text: '#991b1b',
    },
    info: {
      light: '#dbeafe',
      main: '#3b82f6',
      dark: '#1e40af',
      text: '#1e3a8a',
    },

    // 🎨 Colores pastel para calendario (suaves y profesionales)
    calendar: {
      available: {
        light: '#f0fdf4',        // Verde menta muy suave
        lightHover: '#dcfce7',   // Verde menta suave hover
        dark: '#064e3b',         // Verde oscuro para dark mode
        darkHover: '#065f46',    // Verde oscuro hover
        text: '#166534',         // Texto verde oscuro
        textDark: '#86efac',     // Texto verde claro para dark mode
      },
      disabled: {
        light: '#fef2f2',        // Rosa muy suave
        lightHover: '#fee2e2',   // Rosa suave hover
        dark: '#450a0a',         // Rojo muy oscuro para dark mode
        darkHover: '#7f1d1d',    // Rojo oscuro hover
        text: '#991b1b',         // Texto rojo oscuro
        textDark: '#fca5a5',     // Texto rojo claro para dark mode
      },
      selected: {
        light: '#3b82f6',        // Azul primario
        dark: '#2563eb',         // Azul primario oscuro
        text: '#ffffff',         // Texto blanco
      },
    },

    // Status colors (para permisos/estados)
    status: {
      active: '#10b981',
      inactive: '#6b7280',
      pending: '#f59e0b',
      system: '#8b5cf6',
    },

    // 🆕 Colores por módulo del sistema (para permissions, students, etc.)
    modules: {
      user: {
        bg: 'bg-blue-50 dark:bg-blue-950/30',
        bgHover: 'hover:bg-blue-100 dark:hover:bg-blue-950/50',
        text: 'text-blue-700 dark:text-blue-300',
        border: 'border-blue-200 dark:border-blue-800',
        icon: 'text-blue-600 dark:text-blue-400',
        gradient: 'from-blue-500 to-blue-600',
      },
      role: {
        bg: 'bg-purple-50 dark:bg-purple-950/30',
        bgHover: 'hover:bg-purple-100 dark:hover:bg-purple-950/50',
        text: 'text-purple-700 dark:text-purple-300',
        border: 'border-purple-200 dark:border-purple-800',
        icon: 'text-purple-600 dark:text-purple-400',
        gradient: 'from-purple-500 to-purple-600',
      },
      permission: {
        bg: 'bg-indigo-50 dark:bg-indigo-950/30',
        bgHover: 'hover:bg-indigo-100 dark:hover:bg-indigo-950/50',
        text: 'text-indigo-700 dark:text-indigo-300',
        border: 'border-indigo-200 dark:border-indigo-800',
        icon: 'text-indigo-600 dark:text-indigo-400',
        gradient: 'from-indigo-500 to-indigo-600',
      },
      student: {
        bg: 'bg-emerald-50 dark:bg-emerald-950/30',
        bgHover: 'hover:bg-emerald-100 dark:hover:bg-emerald-950/50',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-200 dark:border-emerald-800',
        icon: 'text-emerald-600 dark:text-emerald-400',
        gradient: 'from-emerald-500 to-emerald-600',
      },
      teacher: {
        bg: 'bg-cyan-50 dark:bg-cyan-950/30',
        bgHover: 'hover:bg-cyan-100 dark:hover:bg-cyan-950/50',
        text: 'text-cyan-700 dark:text-cyan-300',
        border: 'border-cyan-200 dark:border-cyan-800',
        icon: 'text-cyan-600 dark:text-cyan-400',
        gradient: 'from-cyan-500 to-cyan-600',
      },
      parent: {
        bg: 'bg-teal-50 dark:bg-teal-950/30',
        bgHover: 'hover:bg-teal-100 dark:hover:bg-teal-950/50',
        text: 'text-teal-700 dark:text-teal-300',
        border: 'border-teal-200 dark:border-teal-800',
        icon: 'text-teal-600 dark:text-teal-400',
        gradient: 'from-teal-500 to-teal-600',
      },
      course: {
        bg: 'bg-rose-50 dark:bg-rose-950/30',
        bgHover: 'hover:bg-rose-100 dark:hover:bg-rose-950/50',
        text: 'text-rose-700 dark:text-rose-300',
        border: 'border-rose-200 dark:border-rose-800',
        icon: 'text-rose-600 dark:text-rose-400',
        gradient: 'from-rose-500 to-rose-600',
      },
      attendance: {
        bg: 'bg-pink-50 dark:bg-pink-950/30',
        bgHover: 'hover:bg-pink-100 dark:hover:bg-pink-950/50',
        text: 'text-pink-700 dark:text-pink-300',
        border: 'border-pink-200 dark:border-pink-800',
        icon: 'text-pink-600 dark:text-pink-400',
        gradient: 'from-pink-500 to-pink-600',
      },
      grade: {
        bg: 'bg-amber-50 dark:bg-amber-950/30',
        bgHover: 'hover:bg-amber-100 dark:hover:bg-amber-950/50',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-200 dark:border-amber-800',
        icon: 'text-amber-600 dark:text-amber-400',
        gradient: 'from-amber-500 to-amber-600',
      },
      schedule: {
        bg: 'bg-violet-50 dark:bg-violet-950/30',
        bgHover: 'hover:bg-violet-100 dark:hover:bg-violet-950/50',
        text: 'text-violet-700 dark:text-violet-300',
        border: 'border-violet-200 dark:border-violet-800',
        icon: 'text-violet-600 dark:text-violet-400',
        gradient: 'from-violet-500 to-violet-600',
      },
      enrollment: {
        bg: 'bg-orange-50 dark:bg-orange-950/30',
        bgHover: 'hover:bg-orange-100 dark:hover:bg-orange-950/50',
        text: 'text-orange-700 dark:text-orange-300',
        border: 'border-orange-200 dark:border-orange-800',
        icon: 'text-orange-600 dark:text-orange-400',
        gradient: 'from-orange-500 to-orange-600',
      },
      section: {
        bg: 'bg-fuchsia-50 dark:bg-fuchsia-950/30',
        bgHover: 'hover:bg-fuchsia-100 dark:hover:bg-fuchsia-950/50',
        text: 'text-fuchsia-700 dark:text-fuchsia-300',
        border: 'border-fuchsia-200 dark:border-fuchsia-800',
        icon: 'text-fuchsia-600 dark:text-fuchsia-400',
        gradient: 'from-fuchsia-500 to-fuchsia-600',
      },
      gradeCycle: {
        bg: 'bg-lime-50 dark:bg-lime-950/30',
        bgHover: 'hover:bg-lime-100 dark:hover:bg-lime-950/50',
        text: 'text-lime-700 dark:text-lime-300',
        border: 'border-lime-200 dark:border-lime-800',
        icon: 'text-lime-600 dark:text-lime-400',
        gradient: 'from-lime-500 to-lime-600',
      },
      assignment: {
        bg: 'bg-sky-50 dark:bg-sky-950/30',
        bgHover: 'hover:bg-sky-100 dark:hover:bg-sky-950/50',
        text: 'text-sky-700 dark:text-sky-300',
        border: 'border-sky-200 dark:border-sky-800',
        icon: 'text-sky-600 dark:text-sky-400',
        gradient: 'from-sky-500 to-sky-600',
      },
      academicWeek: {
        bg: 'bg-indigo-50 dark:bg-indigo-950/30',
        bgHover: 'hover:bg-indigo-100 dark:hover:bg-indigo-950/50',
        text: 'text-indigo-700 dark:text-indigo-300',
        border: 'border-indigo-200 dark:border-indigo-800',
        icon: 'text-indigo-600 dark:text-indigo-400',
        gradient: 'from-indigo-500 to-indigo-600',
      },
      // Fallback para módulos no definidos
      default: {
        bg: 'bg-gray-50 dark:bg-gray-950/30',
        bgHover: 'hover:bg-gray-100 dark:hover:bg-gray-950/50',
        text: 'text-gray-700 dark:text-gray-300',
        border: 'border-gray-200 dark:border-gray-800',
        icon: 'text-gray-600 dark:text-gray-400',
        gradient: 'from-gray-500 to-gray-600',
      },
    },

    // 🆕 Colores por acción (expandido y mejorado)
    actions: {
      create: {
        bg: 'bg-emerald-50 dark:bg-emerald-950/30',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-300 dark:border-emerald-700',
        icon: 'text-emerald-600 dark:text-emerald-400',
        badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
        button: 'bg-emerald-500 hover:bg-emerald-600',
      },
      read: {
        bg: 'bg-blue-50 dark:bg-blue-950/30',
        text: 'text-blue-700 dark:text-blue-300',
        border: 'border-blue-300 dark:border-blue-700',
        icon: 'text-blue-600 dark:text-blue-400',
        badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
        button: 'bg-blue-500 hover:bg-blue-600',
      },
      update: {
        bg: 'bg-amber-50 dark:bg-amber-950/30',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-300 dark:border-amber-700',
        icon: 'text-amber-600 dark:text-amber-400',
        badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
        button: 'bg-amber-500 hover:bg-amber-600',
      },
      delete: {
        bg: 'bg-red-50 dark:bg-red-950/30',
        text: 'text-red-700 dark:text-red-300',
        border: 'border-red-300 dark:border-red-700',
        icon: 'text-red-600 dark:text-red-400',
        badge: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
        button: 'bg-red-500 hover:bg-red-600',
      },
      manage: {
        bg: 'bg-purple-50 dark:bg-purple-950/30',
        text: 'text-purple-700 dark:text-purple-300',
        border: 'border-purple-300 dark:border-purple-700',
        icon: 'text-purple-600 dark:text-purple-400',
        badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
        button: 'bg-purple-500 hover:bg-purple-600',
      },
      // Acciones adicionales comunes
      'read-one': {
        bg: 'bg-sky-50 dark:bg-sky-950/30',
        text: 'text-sky-700 dark:text-sky-300',
        border: 'border-sky-300 dark:border-sky-700',
        icon: 'text-sky-600 dark:text-sky-400',
        badge: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
        button: 'bg-sky-500 hover:bg-sky-600',
      },
      export: {
        bg: 'bg-teal-50 dark:bg-teal-950/30',
        text: 'text-teal-700 dark:text-teal-300',
        border: 'border-teal-300 dark:border-teal-700',
        icon: 'text-teal-600 dark:text-teal-400',
        badge: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
        button: 'bg-teal-500 hover:bg-teal-600',
      },
      import: {
        bg: 'bg-orange-50 dark:bg-orange-950/30',
        text: 'text-orange-700 dark:text-orange-300',
        border: 'border-orange-300 dark:border-orange-700',
        icon: 'text-orange-600 dark:text-orange-400',
        badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
        button: 'bg-orange-500 hover:bg-orange-600',
      },
    },

    // 🆕 Estados expandidos
    statusExtended: {
      active: {
        bg: 'bg-green-50 dark:bg-green-950/30',
        text: 'text-green-700 dark:text-green-300',
        badge: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
        icon: 'text-green-600 dark:text-green-400',
        border: 'border-green-300 dark:border-green-700',
      },
      inactive: {
        bg: 'bg-gray-50 dark:bg-gray-950/30',
        text: 'text-gray-700 dark:text-gray-300',
        badge: 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300',
        icon: 'text-gray-600 dark:text-gray-400',
        border: 'border-gray-300 dark:border-gray-700',
      },
      system: {
        bg: 'bg-purple-50 dark:bg-purple-950/30',
        text: 'text-purple-700 dark:text-purple-300',
        badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
        icon: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-300 dark:border-purple-700',
      },
      pending: {
        bg: 'bg-yellow-50 dark:bg-yellow-950/30',
        text: 'text-yellow-700 dark:text-yellow-300',
        badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
        icon: 'text-yellow-600 dark:text-yellow-400',
        border: 'border-yellow-300 dark:border-yellow-700',
      },
    },
  },

  // 📦 COLORES POR ROL/PERMISO
  roles: {
    admin: {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-300 dark:border-purple-700',
      badge: 'bg-purple-500',
      icon: 'text-purple-600',
    },
    teacher: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-300 dark:border-blue-700',
      badge: 'bg-blue-500',
      icon: 'text-blue-600',
    },
    student: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-700 dark:text-green-300',
      border: 'border-green-300 dark:border-green-700',
      badge: 'bg-green-500',
      icon: 'text-green-600',
    },
    parent: {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-300 dark:border-amber-700',
      badge: 'bg-amber-500',
      icon: 'text-amber-600',
    },
  },

  // 🎯 COLORES POR ACCIÓN (legacy - mantener por compatibilidad)
  permissions: {
    create: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      text: 'text-emerald-700 dark:text-emerald-300',
      icon: 'text-emerald-600',
      button: 'bg-emerald-500 hover:bg-emerald-600',
    },
    read: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-700 dark:text-blue-300',
      icon: 'text-blue-600',
      button: 'bg-blue-500 hover:bg-blue-600',
    },
    update: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      text: 'text-amber-700 dark:text-amber-300',
      icon: 'text-amber-600',
      button: 'bg-amber-500 hover:bg-amber-600',
    },
    delete: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-700 dark:text-red-300',
      icon: 'text-red-600',
      button: 'bg-red-500 hover:bg-red-600',
    },
  },

  // �️ WEEK TYPES (para Academic Weeks)
  weekTypes: {
    REGULAR: {
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      bgHover: 'hover:bg-blue-100 dark:hover:bg-blue-950/50',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-200 dark:border-blue-800',
      icon: 'text-blue-600 dark:text-blue-400',
      badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
      gradient: 'from-blue-500 to-blue-600',
      label: 'Regular',
      description: 'Semana académica normal con clases regulares',
    },
    EVALUATION: {
      bg: 'bg-red-50 dark:bg-red-950/30',
      bgHover: 'hover:bg-red-100 dark:hover:bg-red-950/50',
      text: 'text-red-700 dark:text-red-300',
      border: 'border-red-200 dark:border-red-800',
      icon: 'text-red-600 dark:text-red-400',
      badge: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
      gradient: 'from-red-500 to-red-600',
      label: 'Evaluación',
      description: 'Semana de exámenes y evaluaciones',
    },
    REVIEW: {
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      bgHover: 'hover:bg-amber-100 dark:hover:bg-amber-950/50',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-800',
      icon: 'text-amber-600 dark:text-amber-400',
      badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
      gradient: 'from-amber-500 to-amber-600',
      label: 'Repaso',
      description: 'Semana de repaso y refuerzo de contenidos',
    },
    BREAK: {
      bg: 'bg-gray-50 dark:bg-gray-950/30',
      bgHover: 'hover:bg-gray-100 dark:hover:bg-gray-950/50',
      text: 'text-gray-700 dark:text-gray-300',
      border: 'border-gray-200 dark:border-gray-800',
      icon: 'text-gray-600 dark:text-gray-400',
      badge: 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300',
      gradient: 'from-gray-500 to-gray-600',
      label: 'Receso',
      description: 'Semana de receso o vacaciones',
    },
  },

  // �📏 SPACING & RADIUS
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  radius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    full: '9999px',
  },
} as const;

export type ThemeColors = typeof APP_THEME;

// 🔧 HELPER FUNCTIONS

/**
 * Obtener tema de módulo de forma segura
 * @param module - Nombre del módulo
 * @returns Objeto con clases de Tailwind para el módulo
 */
export const getModuleTheme = (module: string) => {
  const normalizedModule = module.toLowerCase().replace(/[_-]/g, '');
  const key = normalizedModule as keyof typeof APP_THEME.colors.modules;
  return APP_THEME.colors.modules[key] || APP_THEME.colors.modules.default;
};

/**
 * Obtener tema de acción de forma segura
 * @param action - Nombre de la acción
 * @returns Objeto con clases de Tailwind para la acción
 */
export const getActionTheme = (action: string) => {
  const normalizedAction = action.toLowerCase().replace(/[_-]/g, '');
  const key = normalizedAction as keyof typeof APP_THEME.colors.actions;
  return APP_THEME.colors.actions[key] || APP_THEME.colors.actions.read;
};

/**
 * Obtener tema de estado
 * @param status - Estado (active, inactive, system, pending)
 * @returns Objeto con clases de Tailwind para el estado
 */
export const getStatusTheme = (status: 'active' | 'inactive' | 'system' | 'pending') => {
  return APP_THEME.colors.statusExtended[status] || APP_THEME.colors.statusExtended.inactive;
};

/**
 * Obtener tema de rol
 * @param role - Nombre del rol
 * @returns Objeto con clases de Tailwind para el rol
 */
export const getRoleTheme = (role: string) => {
  const normalizedRole = role.toLowerCase() as keyof typeof APP_THEME.roles;
  return APP_THEME.roles[normalizedRole] || APP_THEME.roles.admin;
};

/**
 * Obtener tema de tipo de semana
 * @param weekType - Tipo de semana (REGULAR, EVALUATION, REVIEW, BREAK)
 * @returns Objeto con clases de Tailwind para el tipo de semana
 */
export const getWeekTypeTheme = (weekType: 'REGULAR' | 'EVALUATION' | 'REVIEW' | 'BREAK') => {
  return APP_THEME.weekTypes[weekType] || APP_THEME.weekTypes.REGULAR;
};
