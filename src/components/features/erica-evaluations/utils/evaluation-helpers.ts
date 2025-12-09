// src/components/features/erica-evaluations/utils/evaluation-helpers.ts
import {
  EricaDimension,
  EricaState,
  STATE_POINTS,
  STATE_LABELS,
  DIMENSION_LABELS,
  EvaluationGridData,
  DimensionEvaluation,
} from '@/types/erica-evaluations';

// =====================================================
// CONSTANTES DE DIMENSIONES Y ESTADOS
// =====================================================

/** Orden de las dimensiones para mostrar en grid */
export const DIMENSION_ORDER: EricaDimension[] = [
  'EJECUTA',
  'RETIENE', 
  'INTERPRETA',
  'CONOCE',
  'AMPLIA',
];

/** Orden de los estados por puntuación (de mayor a menor) */
export const STATE_ORDER: EricaState[] = ['E', 'B', 'P', 'C', 'N'];

/** Códigos cortos de dimensiones para columnas compactas */
export const DIMENSION_SHORT_LABELS: Record<EricaDimension, string> = {
  EJECUTA: 'EJE',
  RETIENE: 'RET',
  INTERPRETA: 'INT',
  CONOCE: 'CON',
  AMPLIA: 'AMP',
};

// =====================================================
// FUNCIONES DE UTILIDAD PARA ESTADOS
// =====================================================

/**
 * Obtiene los puntos para un estado dado
 */
export function getStatePoints(state: EricaState): number {
  return STATE_POINTS[state];
}

/**
 * Obtiene la etiqueta completa de un estado
 */
export function getStateLabel(state: EricaState): string {
  return STATE_LABELS[state];
}

/**
 * Obtiene la etiqueta completa de una dimensión
 */
export function getDimensionLabel(dimension: EricaDimension): string {
  return DIMENSION_LABELS[dimension];
}

/**
 * Obtiene el color de fondo para un estado (Tailwind classes)
 */
export function getStateBackgroundColor(state: EricaState, variant: 'solid' | 'light' = 'solid'): string {
  const colors: Record<EricaState, { solid: string; light: string }> = {
    E: { solid: 'bg-green-500', light: 'bg-green-100 dark:bg-green-900/30' },
    B: { solid: 'bg-blue-500', light: 'bg-blue-100 dark:bg-blue-900/30' },
    P: { solid: 'bg-yellow-500', light: 'bg-yellow-100 dark:bg-yellow-900/30' },
    C: { solid: 'bg-orange-500', light: 'bg-orange-100 dark:bg-orange-900/30' },
    N: { solid: 'bg-red-500', light: 'bg-red-100 dark:bg-red-900/30' },
  };
  return colors[state][variant];
}

/**
 * Convierte un color hex a clases de Tailwind dinámicamente
 */
export function getStateBackgroundColorFromHex(hexColor: string, variant: 'solid' | 'light' = 'solid'): string {
  if (variant === 'solid') {
    return `[background-color:${hexColor}]`;
  } else {
    // Para fondo light, reducir opacidad
    return `[background-color:${hexColor}20]`;
  }
}

/**
 * Obtiene el color de texto para un estado (Tailwind classes)
 */
export function getStateTextColor(state: EricaState, isOnSolidBg = false): string {
  if (isOnSolidBg) return 'text-white';
  
  const colors: Record<EricaState, string> = {
    E: 'text-green-800 dark:text-green-200',
    B: 'text-blue-800 dark:text-blue-200',
    P: 'text-yellow-800 dark:text-yellow-200',
    C: 'text-orange-800 dark:text-orange-200',
    N: 'text-red-800 dark:text-red-200',
  };
  return colors[state];
}

/**
 * Obtiene el color del borde para un estado (Tailwind classes)
 */
export function getStateBorderColor(state: EricaState): string {
  const colors: Record<EricaState, string> = {
    E: 'border-green-500',
    B: 'border-blue-500',
    P: 'border-yellow-500',
    C: 'border-orange-500',
    N: 'border-red-500',
  };
  return colors[state];
}

/**
 * Obtiene clases CSS completas para un botón de estado
 */
export function getStateButtonClasses(state: EricaState, isSelected: boolean): string {
  const baseClasses = 'h-full w-full text-xs font-bold transition-all duration-150';
  
  if (isSelected) {
    return `${baseClasses} ${getStateBackgroundColor(state, 'solid')} text-white shadow-md`;
  }
  
  return `${baseClasses} ${getStateBackgroundColor(state, 'light')} ${getStateTextColor(state)} hover:opacity-80`;
}

// =====================================================
// FUNCIONES DE CÁLCULO DE ESTADÍSTICAS
// =====================================================

/**
 * Calcula el promedio de puntos de un estudiante
 */
export function calculateStudentAverage(evaluations: Record<EricaDimension, DimensionEvaluation | null>): number {
  const validEvaluations = DIMENSION_ORDER
    .map(dim => evaluations[dim])
    .filter((ev): ev is DimensionEvaluation => ev !== null && ev !== undefined && ev.points !== undefined);
  
  if (validEvaluations.length === 0) return 0;
  
  const totalPoints = validEvaluations.reduce((sum, ev) => sum + (ev.points || 0), 0);
  return totalPoints / validEvaluations.length;
}

/**
 * Calcula el total de puntos de un estudiante
 */
export function calculateStudentTotalPoints(evaluations: Record<EricaDimension, DimensionEvaluation | null>): number {
  return DIMENSION_ORDER
    .map(dim => evaluations[dim])
    .filter((ev): ev is DimensionEvaluation => ev !== null && ev !== undefined && ev.points !== undefined)
    .reduce((sum, ev) => sum + (ev.points || 0), 0);
}

/**
 * Cuenta las dimensiones completadas de un estudiante
 */
export function countCompletedDimensions(evaluations: Record<EricaDimension, DimensionEvaluation | null>): number {
  return DIMENSION_ORDER.filter(dim => evaluations[dim] !== null).length;
}

/**
 * Verifica si un estudiante tiene todas las dimensiones evaluadas
 */
export function isStudentFullyEvaluated(evaluations: Record<EricaDimension, DimensionEvaluation | null>): boolean {
  return countCompletedDimensions(evaluations) === DIMENSION_ORDER.length;
}

/**
 * Calcula el porcentaje de completitud de un estudiante
 */
export function calculateCompletionPercentage(evaluations: Record<EricaDimension, DimensionEvaluation | null>): number {
  return (countCompletedDimensions(evaluations) / DIMENSION_ORDER.length) * 100;
}

// =====================================================
// FUNCIONES DE TRANSFORMACIÓN DE DATOS
// =====================================================

/**
 * Convierte EvaluationGridData a un objeto de evaluaciones por dimensión
 */
export function gridDataToEvaluationsMap(
  gridData: EvaluationGridData
): Record<EricaDimension, DimensionEvaluation | null> {
  return {
    EJECUTA: gridData.EJECUTA,
    RETIENE: gridData.RETIENE,
    INTERPRETA: gridData.INTERPRETA,
    CONOCE: gridData.CONOCE,
    AMPLIA: gridData.AMPLIA,
  };
}

/**
 * Crea un objeto de evaluación vacío
 */
export function createEmptyEvaluationsMap(): Record<EricaDimension, DimensionEvaluation | null> {
  return {
    EJECUTA: null,
    RETIENE: null,
    INTERPRETA: null,
    CONOCE: null,
    AMPLIA: null,
  };
}

/**
 * Crea una evaluación de dimensión con un estado dado
 */
export function createDimensionEvaluation(
  state: EricaState,
  notes?: string | null,
  id?: number
): DimensionEvaluation {
  return {
    id,
    state,
    points: STATE_POINTS[state],
    notes,
  };
}

// =====================================================
// FUNCIONES DE VALIDACIÓN
// =====================================================

/**
 * Valida si un string es un estado ERICA válido
 */
export function isValidState(value: string): value is EricaState {
  return STATE_ORDER.includes(value as EricaState);
}

/**
 * Valida si un string es una dimensión ERICA válida
 */
export function isValidDimension(value: string): value is EricaDimension {
  return DIMENSION_ORDER.includes(value as EricaDimension);
}

// =====================================================
// FUNCIONES DE FORMATEO
// =====================================================

/**
 * Formatea puntos con 2 decimales
 */
export function formatPoints(points: number): string {
  return points.toFixed(2);
}

/**
 * Formatea porcentaje
 */
export function formatPercentage(percentage: number): string {
  return `${Math.round(percentage)}%`;
}

/**
 * Obtiene las iniciales de un nombre completo
 */
export function getStudentInitials(givenNames: string, lastNames: string): string {
  const firstName = givenNames.split(' ')[0] || '';
  const lastName = lastNames.split(' ')[0] || '';
  return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
}

/**
 * Formatea nombre completo como "Apellidos, Nombres"
 */
export function formatStudentName(givenNames: string, lastNames: string): string {
  return `${lastNames}, ${givenNames}`;
}
