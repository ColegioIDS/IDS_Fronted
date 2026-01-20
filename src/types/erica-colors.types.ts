// src/types/erica-colors.types.ts

/**
 * Configuración de color ERICA
 */
export interface ColorConfig {
  dimension?: string;
  state?: string;
  hexColor: string;
  rgbColor?: string;
  description?: string;
}

/**
 * Respuesta de color de la API
 */
export interface EricaColor {
  id: number;
  hexColor: string;
  rgbColor?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Color de dimensión ERICA (E, R, I, C, A)
 */
export interface EricaDimensionColor extends EricaColor {
  dimension: string;
  name: string;
  description?: string;
}

/**
 * Color de estado (E, B, P, C, N)
 */
export interface EricaStateColor extends EricaColor {
  state: string;
  name: string;
  description?: string;
  points?: number;
  label?: string;
}

/**
 * Respuesta combinada de colores
 */
export interface EricaColorsResponse {
  dimensions: EricaDimensionColor[];
  states: EricaStateColor[];
}

/**
 * DTO para actualizar color
 */
export interface UpdateColorDto {
  hexColor: string;
}

/**
 * Tipo para dimensión ERICA
 */
export type EricaDimension = 'EJECUTA' | 'RETIENE' | 'INTERPRETA' | 'CONOCE' | 'APLICA';

/**
 * Tipo para estado de desempeño
 */
export type EricaState = 'E' | 'B' | 'P' | 'C' | 'N';

/**
 * Mapa de colores en caché
 */
export interface CachedEricaColors {
  dimensions: Map<EricaDimension, string>;
  states: Map<EricaState, string>;
  labels: Map<EricaState, string>;
  lastUpdated: number;
}

/**
 * Constantes de dimensiones ERICA
 */
export const ERICA_DIMENSIONS: EricaDimension[] = [
  'EJECUTA',
  'RETIENE',
  'INTERPRETA',
  'CONOCE',
  'APLICA',
];

/**
 * Constantes de estados ERICA
 */
export const ERICA_STATES: EricaState[] = ['E', 'B', 'P', 'C', 'N'];

/**
 * Mapeo de estados a etiquetas
 */
export const STATE_LABELS: Record<EricaState, string> = {
  E: 'Excelente',
  B: 'Bien',
  P: 'Poco',
  C: 'Casi Nada',
  N: 'Nada',
};

/**
 * Colores por defecto (fallback)
 */
export const DEFAULT_COLORS: EricaColorsResponse = {
  dimensions: [
    {
      id: 1,
      dimension: 'EJECUTA',
      name: 'Ejecuta',
      description: 'Dimensión que ejecuta acciones',
      hexColor: '#FF6B6B',
      rgbColor: 'rgb(255, 107, 107)',
    },
    {
      id: 2,
      dimension: 'R',
      name: 'Retiene',
      description: 'Dimensión que retiene información',
      hexColor: '#4ECDC4',
      rgbColor: 'rgb(78, 205, 196)',
    },
    {
      id: 3,
      dimension: 'I',
      name: 'Interpreta',
      description: 'Dimensión que interpreta conceptos',
      hexColor: '#45B7D1',
      rgbColor: 'rgb(69, 183, 209)',
    },
    {
      id: 4,
      dimension: 'C',
      name: 'Conoce',
      description: 'Dimensión de conocimiento',
      hexColor: '#96CEB4',
      rgbColor: 'rgb(150, 206, 180)',
    },
    {
      id: 5,
      dimension: 'A',
      name: 'Aplica',
      description: 'Dimensión que aplica extensiones',
      hexColor: '#FFEAA7',
      rgbColor: 'rgb(255, 234, 167)',
    },
  ],
  states: [
    {
      id: 6,
      state: 'E',
      name: 'Excelente (1.0 pts)',
      description: 'Desempeño excelente',
      points: 1.0,
      hexColor: '#4CAF50',
      rgbColor: 'rgb(76, 175, 80)',
      label: 'Excelente',
    },
    {
      id: 7,
      state: 'B',
      name: 'Bien (0.75 pts)',
      description: 'Desempeño bueno',
      points: 0.75,
      hexColor: '#FFC107',
      rgbColor: 'rgb(255, 193, 7)',
      label: 'Bien',
    },
    {
      id: 8,
      state: 'P',
      name: 'Poco (0.50 pts)',
      description: 'Desempeño poco proficiente',
      points: 0.50,
      hexColor: '#2196F3',
      rgbColor: 'rgb(33, 150, 243)',
      label: 'Poco',
    },
    {
      id: 9,
      state: 'C',
      name: 'Casi nada (0.25 pts)',
      description: 'Desempeño en construcción',
      points: 0.25,
      hexColor: '#FF9800',
      rgbColor: 'rgb(255, 152, 0)',
      label: 'Casi nada',
    },
    {
      id: 10,
      state: 'N',
      name: 'Nada (0.0 pts)',
      description: 'Desempeño no logrado',
      points: 0.0,
      hexColor: '#F44336',
      rgbColor: 'rgb(244, 67, 54)',
      label: 'Nada',
    },
  ],
};
