// src/constants/performance-levels.ts

/**
 * Niveles de rendimiento para evaluaciones QNA
 * Basados en promedios de desempeño
 */

export const PERFORMANCE_LEVELS = {
  RED: {
    key: 'RED',
    label: 'Seguimiento continuo',
    description: 'Promedio ≤ 0.50',
    hexColor: '#F44336',
    minValue: 0,
    maxValue: 0.5,
  },
  YELLOW: {
    key: 'YELLOW',
    label: 'Mantener en la mira',
    description: 'Promedio > 0.50 y ≤ 0.75',
    hexColor: '#FFC107',
    minValue: 0.501,
    maxValue: 0.75,
  },
  GREEN: {
    key: 'GREEN',
    label: 'Buen rendimiento',
    description: 'Promedio > 0.75',
    hexColor: '#4CAF50',
    minValue: 0.751,
    maxValue: 1.0,
  },
};

export type PerformanceLevel = keyof typeof PERFORMANCE_LEVELS;

/**
 * Obtener el nivel de rendimiento según el promedio
 * @param average - Promedio de desempeño (0 a 1)
 * @returns Objeto con información del nivel de rendimiento
 */
export function getPerformanceLevel(average: number) {
  if (average <= 0.5) {
    return PERFORMANCE_LEVELS.RED;
  } else if (average <= 0.75) {
    return PERFORMANCE_LEVELS.YELLOW;
  } else {
    return PERFORMANCE_LEVELS.GREEN;
  }
}

/**
 * Obtener color hex según el promedio
 * @param average - Promedio de desempeño (0 a 1)
 * @returns Color hex del nivel de rendimiento
 */
export function getPerformanceLevelColor(average: number): string {
  return getPerformanceLevel(average).hexColor;
}

/**
 * Obtener label según el promedio
 * @param average - Promedio de desempeño (0 a 1)
 * @returns Label descriptivo del nivel de rendimiento
 */
export function getPerformanceLevelLabel(average: number): string {
  return getPerformanceLevel(average).label;
}
