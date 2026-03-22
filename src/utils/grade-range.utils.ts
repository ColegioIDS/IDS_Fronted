/**
 * 🎨 Utilidades para determinar colores según calificaciones
 */

import { GradeRange } from '@/types/academic-analytics.types';

/**
 * Encuentra el rango de calificación que corresponde a una puntuación específica
 *
 * @param score - La puntuación a buscar
 * @param ranges - Array de rangos de calificaciones disponibles
 * @param level - Nivel educativo (opcional) para filtrar rangos específicos del nivel
 * @returns El rango encontrado o undefined
 *
 * @example
 * const range = findGradeRange(85, gradeRanges, 'Primaria');
 * console.log(range?.hexColor); // "#FFD700" (ejemplo)
 */
export function findGradeRange(
  score: number,
  ranges: GradeRange[],
  level?: string
): GradeRange | undefined {
  // Filtrar rangos por nivel si se proporciona
  let applicableRanges = ranges;
  if (level) {
    applicableRanges = ranges.filter(
      r => r.level === 'all' || r.level === level
    );
  }

  // Filtrar activos y ordenar por puntuación mínima descendente
  const activeRanges = applicableRanges
    .filter(r => r.isActive)
    .sort((a, b) => b.minScore - a.minScore);

  // Encontrar el rango donde el score está dentro del rango
  return activeRanges.find(
    r => score >= r.minScore && score <= r.maxScore
  );
}

/**
 * Obtiene el color hexadecimal para una puntuación específica
 *
 * @param score - La puntuación a buscar
 * @param ranges - Array de rangos de calificaciones disponibles
 * @param level - Nivel educativo (opcional)
 * @param defaultColor - Color por defecto si no encuentra rango
 * @returns El color hexadecimal o el color por defecto
 *
 * @example
 * const color = getColorForScore(75, gradeRanges, 'Primaria');
 */
export function getColorForScore(
  score: number,
  ranges: GradeRange[],
  level?: string,
  defaultColor: string = '#CCCCCC'
): string {
  const range = findGradeRange(score, ranges, level);
  return range?.hexColor || defaultColor;
}

/**
 * Obtiene la información del rango para una puntuación específica
 *
 * @param score - La puntuación a buscar
 * @param ranges - Array de rangos de calificaciones disponibles
 * @param level - Nivel educativo (opcional)
 * @returns Objeto con nombre, descripción y color, o valores por defecto
 *
 * @example
 * const info = getRangeInfo(95, gradeRanges, 'Primaria');
 * console.log(info); // {name: 'Excelente', description: '...', hexColor: '...'}
 */
export function getRangeInfo(
  score: number,
  ranges: GradeRange[],
  level?: string
): {
  name: string;
  description: string;
  hexColor: string;
  letterGrade: string | null;
} {
  const range = findGradeRange(score, ranges, level);

  if (!range) {
    return {
      name: 'N/A',
      description: 'Sin calificación',
      hexColor: '#CCCCCC',
      letterGrade: null,
    };
  }

  return {
    name: range.name,
    description: range.description,
    hexColor: range.hexColor,
    letterGrade: range.letterGrade,
  };
}

/**
 * Convierte un color hexadecimal a RGB para usar en estilos
 *
 * @param hex - Color en formato hexadecimal (ej: "#FF0000")
 * @returns Objeto con propiedades r, g, b
 *
 * @example
 * const rgb = hexToRgb('#FF0000');
 * console.log(rgb); // {r: 255, g: 0, b: 0}
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Crea un color RGBA a partir de un hexadecimal y opacidad
 *
 * @param hex - Color en formato hexadecimal
 * @param alpha - Opacidad de 0 a 1
 * @returns String de color RGBA
 *
 * @example
 * const rgba = hexToRgba('#FF0000', 0.5);
 * console.log(rgba); // "rgba(255, 0, 0, 0.5)"
 */
export function hexToRgba(hex: string, alpha: number = 1): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return 'rgba(0, 0, 0, 1)';
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}
