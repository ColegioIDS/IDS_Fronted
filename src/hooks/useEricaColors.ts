// src/hooks/useEricaColors.ts

import { useState, useCallback, useEffect } from 'react';
import { ericaColorsService } from '@/services/erica-colors.service';
import {
  EricaColorsResponse,
  EricaDimensionColor,
  EricaStateColor,
  EricaDimension,
  EricaState,
  DEFAULT_COLORS,
  STATE_LABELS,
} from '@/types/erica-colors.types';

export const useEricaColors = () => {
  const [colors, setColors] = useState<EricaColorsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  /**
   * Cargar colores desde API
   */
  const fetchColors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener del servidor
      const result = await ericaColorsService.getEricaColors();
      console.log('✅ Colors loaded:', result);
      setColors(result);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cargar colores';
      setError(errorMsg);
      console.error('❌ Error fetching ERICA colors:', err);
      // Usar colores por defecto como fallback
      console.log('Using default colors as fallback');
      setColors(DEFAULT_COLORS);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, []);

  /**
   * Obtener color de dimensión por nombre
   */
  const getDimensionColor = useCallback(
    (dimension: EricaDimension): string => {
      if (!colors?.dimensions) return '#CCCCCC';
      const dimColor = colors.dimensions.find((d) => d.dimension === dimension);
      return dimColor?.hexColor || '#CCCCCC';
    },
    [colors]
  );

  /**
   * Obtener color de estado por estado
   */
  const getStateColor = useCallback(
    (state: EricaState): string => {
      if (!colors?.states) return '#999999';
      const stateColor = colors.states.find((s) => s.state === state);
      return stateColor?.hexColor || '#999999';
    },
    [colors]
  );

  /**
   * Obtener etiqueta de estado
   */
  const getStateLabel = useCallback((state: EricaState): string => {
    return STATE_LABELS[state] || state;
  }, []);

  /**
   * Obtener códigos ERICA para dimensiones
   */
  const getEricaDimensionCodes = useCallback((): string[] => {
    return colors?.dimensions.map((d) => d.dimension) || ['E', 'R', 'I', 'C', 'A'];
  }, [colors]);

  /**
   * Obtener códigos de estados EBPCN
   */
  const getEricaStateCodes = useCallback((): string[] => {
    return colors?.states.map((s) => s.state) || ['E', 'B', 'P', 'C', 'N'];
  }, [colors]);

  /**
   * Obtener dimensión por código
   */
  const getDimensionByCode = useCallback(
    (code: string): EricaDimensionColor | undefined => {
      return colors?.dimensions.find((d) => d.dimension === code);
    },
    [colors]
  );

  /**
   * Obtener estado por código
   */
  const getStateByCode = useCallback(
    (code: string): EricaStateColor | undefined => {
      return colors?.states.find((s) => s.state === code);
    },
    [colors]
  );

  /**
   * Obtener objeto completo de dimensión
   */
  const getDimension = useCallback(
    (dimension: EricaDimension): EricaDimensionColor | undefined => {
      return colors?.dimensions.find((d) => d.dimension === dimension);
    },
    [colors]
  );

  /**
   * Obtener objeto completo de estado
   */
  const getState = useCallback(
    (state: EricaState): EricaStateColor | undefined => {
      return colors?.states.find((s) => s.state === state);
    },
    [colors]
  );

  /**
   * Actualizar color de dimensión
   */
  const updateDimensionColor = useCallback(
    async (dimension: EricaDimension, colorHex: string) => {
      try {
        setError(null);

        const updated = await ericaColorsService.updateDimensionColor(
          dimension,
          colorHex
        );

        // Actualizar estado local sin mostrar loading
        setColors((prev) => {
          if (!prev) return DEFAULT_COLORS;
          return {
            ...prev,
            dimensions: prev.dimensions.map((d) =>
              d.dimension === dimension ? updated : d
            ),
          };
        });

        // Recargar datos del servidor después de 500ms
        setTimeout(() => {
          fetchColors();
        }, 500);

        return updated;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Error al actualizar color';
        setError(errorMsg);
        throw err;
      }
    },
    [fetchColors]
  );

  /**
   * Actualizar color de estado
   */
  const updateStateColor = useCallback(
    async (state: EricaState, colorHex: string) => {
      try {
        setError(null);

        const updated = await ericaColorsService.updateStateColor(
          state,
          colorHex
        );

        // Actualizar estado local sin mostrar loading
        setColors((prev) => {
          if (!prev) return DEFAULT_COLORS;
          return {
            ...prev,
            states: prev.states.map((s) => (s.state === state ? updated : s)),
          };
        });

        // Recargar datos del servidor después de 500ms
        setTimeout(() => {
          fetchColors();
        }, 500);

        return updated;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Error al actualizar color';
        setError(errorMsg);
        throw err;
      }
    },
    [fetchColors]
  );

  /**
   * Limpiar caché
   */
  // Cargar colores al montar el hook
  useEffect(() => {
    fetchColors();
  }, [fetchColors]);

  return {
    colors,
    loading,
    error,
    getDimensionColor,
    getStateColor,
    getStateLabel,
    getDimension,
    getState,
    updateDimensionColor,
    updateStateColor,
    fetchColors,
    getEricaDimensionCodes,
    getEricaStateCodes,
    getDimensionByCode,
    getStateByCode,
  };
};
