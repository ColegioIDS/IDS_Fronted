// src/services/erica-colors.service.ts

import { api } from '@/config/api';
import {
  EricaColor,
  EricaDimensionColor,
  EricaStateColor,
  EricaColorsResponse,
  UpdateColorDto,
  EricaDimension,
  EricaState,
  DEFAULT_COLORS,
} from '@/types/erica-colors.types';

/**
 * Helper para extraer mensaje de error
 */
function extractErrorMessage(responseData: any, defaultMessage: string): string {
  if (responseData?.reason === 'INSUFFICIENT_PERMISSIONS') {
    if (responseData?.details?.length > 0) {
      return responseData.details.join(', ');
    }
    return responseData?.message || 'No tiene permisos para realizar esta acción';
  }
  return responseData?.message || defaultMessage;
}

/**
 * Servicio para gestionar colores ERICA
 */
export const ericaColorsService = {
  /**
   * Obtener colores de dimensiones desde nuevo endpoint de configuración
   * GET /api/erica-evaluations/config/dimension-colors
   */
  async getEricaDimensionColorsFromConfig(): Promise<EricaDimensionColor[]> {
    try {
      const response = await fetch('/api/erica-evaluations/config/dimension-colors');
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      const responseData = await response.json();
      
      // Mapear para asegurar que dimension existe
      return (responseData.data || []).map((d: any) => ({
        ...d,
        dimension: d.dimension || d.name,
      }));
    } catch (error: any) {
      console.error('Error fetching dimension colors from config:', error);
      return DEFAULT_COLORS.dimensions;
    }
  },

  /**
   * Obtener todos los colores de dimensiones
   */
  async getEricaDimensionColors(): Promise<EricaDimensionColor[]> {
    try {
      const response = await api.get('/api/erica-colors/dimensions');

      // La API retorna directamente el array en response.data
      const data = Array.isArray(response.data) ? response.data : response.data.data || DEFAULT_COLORS.dimensions;
      
      // Mapear para asegurar que dimension existe
      return data.map((d: any) => ({
        ...d,
        dimension: d.dimension || d.name,
      }));
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(
          extractErrorMessage(
            error.response.data,
            'Error al obtener colores de dimensiones'
          )
        );
      }
      console.error('Error fetching dimension colors:', error);
      return DEFAULT_COLORS.dimensions;
    }
  },

  /**
   * Obtener colores de estados desde nuevo endpoint de configuración
   * GET /api/erica-evaluations/config/state-colors
   */
  async getEricaStateColorsFromConfig(): Promise<EricaStateColor[]> {
    try {
      const response = await fetch('/api/erica-evaluations/config/state-colors');
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      const responseData = await response.json();
      
      // Mapear para asegurar que state existe
      return (responseData.data || []).map((s: any) => ({
        ...s,
        state: s.state || s.name,
      }));
    } catch (error: any) {
      console.error('Error fetching state colors from config:', error);
      return DEFAULT_COLORS.states;
    }
  },

  /**
   * Obtener todos los colores de estados
   */
  async getEricaStateColors(): Promise<EricaStateColor[]> {
    try {
      const response = await api.get('/api/erica-colors/states');

      // La API retorna directamente el array en response.data
      const data = Array.isArray(response.data) ? response.data : response.data.data || DEFAULT_COLORS.states;
      
      // Mapear para asegurar que state existe
      return data.map((s: any) => ({
        ...s,
        state: s.state || s.name,
      }));
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(
          extractErrorMessage(
            error.response.data,
            'Error al obtener colores de estados'
          )
        );
      }
      console.error('Error fetching state colors:', error);
      return DEFAULT_COLORS.states;
    }
  },

  /**
   * Obtener todos los colores (dimensiones + estados)
   */
  async getEricaColors(): Promise<EricaColorsResponse> {
    try {
      const response = await api.get('/api/erica-colors');

      // La API retorna directamente dimensions y states en la raíz
      const data = response.data.dimensions ? response.data : response.data.data || DEFAULT_COLORS;
      
      // Mapear respuesta para asegurar que dimension y state existan
      return {
        dimensions: (data.dimensions || []).map((d: any) => ({
          ...d,
          dimension: d.dimension || d.name,
        })),
        states: (data.states || []).map((s: any) => ({
          ...s,
          state: s.state || s.name,
        })),
      };
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(
          extractErrorMessage(error.response.data, 'Error al obtener colores ERICA')
        );
      }
      console.error('Error fetching ERICA colors:', error);
      return DEFAULT_COLORS;
    }
  },

  /**
   * Actualizar color de dimensión
   */
  async updateDimensionColor(
    dimension: EricaDimension,
    hexCode: string
  ): Promise<EricaDimensionColor> {
    // ✅ VALIDACIÓN
    if (!dimension || dimension.trim().length === 0) {
      throw new Error('Dimensión requerida');
    }
    if (!hexCode || !this.isValidHexColor(hexCode)) {
      throw new Error('Color hexadecimal inválido (#RRGGBB)');
    }

    try {
      const payload = {
        hexColor: hexCode,
      };

      const response = await api.put(
        `/api/erica-colors/dimensions/${dimension}`,
        payload
      );

      // Mapear respuesta a formato esperado
      const data = response.data;
      return {
        ...data,
        dimension: data.dimension || data.name || dimension,
      } as EricaDimensionColor;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(
          extractErrorMessage(
            error.response.data,
            `Error al actualizar color de ${dimension}`
          )
        );
      }
      throw error;
    }
  },

  /**
   * Actualizar color de estado
   */
  async updateStateColor(
    state: EricaState,
    hexCode: string
  ): Promise<EricaStateColor> {
    // ✅ VALIDACIÓN
    if (!state || state.trim().length === 0) {
      throw new Error('Estado requerido');
    }
    if (!hexCode || !this.isValidHexColor(hexCode)) {
      throw new Error('Color hexadecimal inválido (#RRGGBB)');
    }

    try {
      const payload = {
        hexColor: hexCode,
      };

      const response = await api.put(
        `/api/erica-colors/states/${state}`,
        payload
      );

      // Mapear respuesta a formato esperado
      const data = response.data;
      return {
        ...data,
        state: data.state || data.name || state,
      } as EricaStateColor;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(
          extractErrorMessage(
            error.response.data,
            `Error al actualizar color de estado ${state}`
          )
        );
      }
      throw error;
    }
  },

  /**
   * Validar formato hexadecimal
   */
  isValidHexColor(hex: string): boolean {
    return /^#[0-9A-F]{6}$/i.test(hex);
  },

  /**
   * Convertir hex a RGB
   */
  hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  },

  /**
   * Convertir RGB a hex
   */
  rgbToHex(r: number, g: number, b: number): string {
    return (
      '#' +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        })
        .join('')
        .toUpperCase()
    );
  },
};
