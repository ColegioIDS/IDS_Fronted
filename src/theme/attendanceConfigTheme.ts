// src/theme/attendanceConfigTheme.ts

/**
 * Paleta de colores y tema para AttendanceConfig
 * Centraliza todos los colores para fácil personalización
 * Soporta dark mode automáticamente
 */

export const attendanceConfigTheme = {
  // Colores principales del módulo
  primary: {
    light: {
      bg: 'bg-blue-50',
      bgHover: 'hover:bg-blue-100',
      border: 'border-blue-200',
      text: 'text-blue-900',
      textMuted: 'text-blue-600',
      badge: 'bg-blue-100 text-blue-800 border-blue-300',
    },
    dark: {
      bg: 'dark:bg-blue-900/20',
      bgHover: 'dark:hover:bg-blue-900/30',
      border: 'dark:border-blue-800',
      text: 'dark:text-blue-100',
      textMuted: 'dark:text-blue-400',
      badge: 'dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
    },
  },

  // Color para configuración activa
  active: {
    light: {
      bg: 'bg-green-50',
      bgHover: 'hover:bg-green-100',
      border: 'border-green-200',
      text: 'text-green-900',
      textMuted: 'text-green-600',
      badge: 'bg-green-100 text-green-800 border-green-300',
      icon: 'text-green-600',
    },
    dark: {
      bg: 'dark:bg-green-900/20',
      bgHover: 'dark:hover:bg-green-900/30',
      border: 'dark:border-green-800',
      text: 'dark:text-green-100',
      textMuted: 'dark:text-green-400',
      badge: 'dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
      icon: 'dark:text-green-400',
    },
  },

  // Color para warning/porcentaje
  warning: {
    light: {
      bg: 'bg-amber-50',
      bgHover: 'hover:bg-amber-100',
      border: 'border-amber-200',
      text: 'text-amber-900',
      textMuted: 'text-amber-600',
      badge: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: 'text-amber-600',
    },
    dark: {
      bg: 'dark:bg-amber-900/20',
      bgHover: 'dark:hover:bg-amber-900/30',
      border: 'dark:border-amber-800',
      text: 'dark:text-amber-100',
      textMuted: 'dark:text-amber-400',
      badge: 'dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700',
      icon: 'dark:text-amber-400',
    },
  },

  // Color para error/deletear
  danger: {
    light: {
      bg: 'bg-red-50',
      bgHover: 'hover:bg-red-100',
      border: 'border-red-200',
      text: 'text-red-900',
      textMuted: 'text-red-600',
      badge: 'bg-red-100 text-red-800 border-red-300',
      icon: 'text-red-600',
    },
    dark: {
      bg: 'dark:bg-red-900/20',
      bgHover: 'dark:hover:bg-red-900/30',
      border: 'dark:border-red-800',
      text: 'dark:text-red-100',
      textMuted: 'dark:text-red-400',
      badge: 'dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
      icon: 'dark:text-red-400',
    },
  },

  // Color para info
  info: {
    light: {
      bg: 'bg-cyan-50',
      bgHover: 'hover:bg-cyan-100',
      border: 'border-cyan-200',
      text: 'text-cyan-900',
      textMuted: 'text-cyan-600',
      badge: 'bg-cyan-100 text-cyan-800 border-cyan-300',
      icon: 'text-cyan-600',
    },
    dark: {
      bg: 'dark:bg-cyan-900/20',
      bgHover: 'dark:hover:bg-cyan-900/30',
      border: 'dark:border-cyan-800',
      text: 'dark:text-cyan-100',
      textMuted: 'dark:text-cyan-400',
      badge: 'dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-700',
      icon: 'dark:text-cyan-400',
    },
  },

  // Color para neutral/default
  neutral: {
    light: {
      bg: 'bg-gray-50',
      bgHover: 'hover:bg-gray-100',
      border: 'border-gray-200',
      text: 'text-gray-900',
      textMuted: 'text-gray-600',
      badge: 'bg-gray-100 text-gray-800 border-gray-300',
      icon: 'text-gray-600',
    },
    dark: {
      bg: 'dark:bg-gray-900/50',
      bgHover: 'dark:hover:bg-gray-900/70',
      border: 'dark:border-gray-700',
      text: 'dark:text-gray-100',
      textMuted: 'dark:text-gray-400',
      badge: 'dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
      icon: 'dark:text-gray-400',
    },
  },

  // Colores por acción para badges
  actions: {
    create: {
      light: 'bg-green-100 text-green-800 border-green-300',
      dark: 'dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
    },
    read: {
      light: 'bg-blue-100 text-blue-800 border-blue-300',
      dark: 'dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
    },
    update: {
      light: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      dark: 'dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700',
    },
    delete: {
      light: 'bg-red-100 text-red-800 border-red-300',
      dark: 'dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
    },
  },

  // Combinaciones frecuentes
  combinations: {
    cardActive: 'bg-white dark:bg-gray-800 border-l-4 border-green-500 shadow-sm hover:shadow-md',
    cardInactive: 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700',
    inputBg: 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600',
    headerBg: 'bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-900 dark:to-blue-800',
  },

  // Utilidades
  utilities: {
    separator: 'bg-gray-200 dark:bg-gray-700',
    divider: 'border-gray-200 dark:border-gray-700',
    scrollbar: 'scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600',
    shadow: 'shadow-md dark:shadow-xl',
    ring: 'ring-blue-500 dark:ring-blue-400',
  },
};

/**
 * Helper para combinar colores light + dark
 * @param lightClasses - Clases para light mode
 * @param darkClasses - Clases para dark mode
 * @returns Clases combinadas
 * 
 * @example
 * const classes = combineTheme(theme.primary.light.bg, theme.primary.dark.bg);
 * // Resultado: "bg-blue-50 dark:bg-blue-900/20"
 */
export const combineTheme = (
  lightClasses: string,
  darkClasses: string
): string => {
  return `${lightClasses} ${darkClasses}`;
};

/**
 * Helper para obtener tema completo de un color
 * @param colorKey - 'primary' | 'active' | 'warning' | 'danger' | 'info' | 'neutral'
 * @returns Objeto con light y dark
 * 
 * @example
 * const theme = getTheme('primary');
 * // Resultado: { light: {...}, dark: {...} }
 */
export const getTheme = (
  colorKey: keyof typeof attendanceConfigTheme
) => {
  return attendanceConfigTheme[colorKey];
};

/**
 * Helper para obtener clase combinada de un tema
 * @param colorKey - Clave del color
 * @param property - 'bg' | 'border' | 'text' | 'textMuted' | 'badge' | 'icon'
 * @returns Clases light + dark
 * 
 * @example
 * const bgClasses = getThemeClass('primary', 'bg');
 * // Resultado: "bg-blue-50 dark:bg-blue-900/20"
 */
type ThemeSide = Partial<Record<'bg' | 'bgHover' | 'border' | 'text' | 'textMuted' | 'badge' | 'icon', string>>;

export const getThemeClass = (
  colorKey: keyof typeof attendanceConfigTheme,
  property: 'bg' | 'border' | 'text' | 'textMuted' | 'badge' | 'icon' | 'bgHover'
): string => {
  const theme = attendanceConfigTheme[colorKey] as { light?: ThemeSide; dark?: ThemeSide } | undefined;
  if (theme && theme.light && theme.dark) {
    const lightVal = theme.light[property] || '';
    const darkVal = theme.dark[property] || '';
    return combineTheme(lightVal, darkVal);
  }
  return '';
};

/**
 * Helper para obtener color de acción
 * @param action - 'create' | 'read' | 'update' | 'delete'
 * @returns Clases light + dark
 */
export const getActionColor = (
  action: 'create' | 'read' | 'update' | 'delete'
): string => {
  const actionColors = attendanceConfigTheme.actions[action];
  return combineTheme(actionColors.light, actionColors.dark);
};

export default attendanceConfigTheme;