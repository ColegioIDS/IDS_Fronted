// src/hooks/useAttendanceConfig.ts

import { useState, useCallback, useEffect } from 'react';
import attendanceConfigService from '@/services/attendanceConfigService';
import {
  AttendanceConfig,
  AttendanceConfigDefaults,
  CreateAttendanceConfigDto,
  UpdateAttendanceConfigDto,
  AttendanceConfigQueryParams,
  AttendanceConfigListResponse,
  AttendanceConfigState,
  AttendanceConfigError,
} from '@/types/attendanceConfig';

/**
 * Estado inicial para AttendanceConfig
 */
const initialState: AttendanceConfigState = {
  activeConfig: null,
  configs: [],
  defaults: null,
  isLoadingActive: false,
  isLoadingList: false,
  isLoadingDefaults: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  validationErrors: null,
  pagination: null,
};

/**
 * Hook personalizado para gestionar la configuración de asistencia
 * Proporciona métodos para obtener, crear, actualizar y eliminar configuraciones
 * 
 * @returns {Object} Objeto con estado y métodos
 * 
 * @example
 * const {
 *   activeConfig,
 *   configs,
 *   isLoadingActive,
 *   fetchActiveConfig,
 *   createConfig,
 *   error
 * } = useAttendanceConfig();
 * 
 * useEffect(() => {
 *   fetchActiveConfig();
 * }, []);
 * 
 * if (isLoadingActive) return <Spinner />;
 * if (error) return <ErrorAlert message={error} />;
 * if (!activeConfig) return <NotFound />;
 * 
 * return <div>{activeConfig.riskThresholdPercentage}%</div>;
 */
export const useAttendanceConfig = () => {
  const [state, setState] = useState<AttendanceConfigState>(initialState);

  /**
   * Obtener configuración activa
   */
  const fetchActiveConfig = useCallback(async () => {
    setState(prev => ({ ...prev, isLoadingActive: true, error: null }));
    try {
      const config = await attendanceConfigService.getActiveConfig();
      setState(prev => ({
        ...prev,
        activeConfig: config,
        isLoadingActive: false,
      }));
      return config;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoadingActive: false,
      }));
      throw error;
    }
  }, []);

  /**
   * Obtener lista de configuraciones
   */
  const fetchConfigs = useCallback(
    async (params: AttendanceConfigQueryParams = {}) => {
      setState(prev => ({ ...prev, isLoadingList: true, error: null }));
      try {
        const response = await attendanceConfigService.listConfigs(params);
        console.log('Fetched configs:', response.data);
        setState(prev => ({
          ...prev,
          configs: response.data,
          pagination: response.meta,
          isLoadingList: false,
        }));
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        setState(prev => ({
          ...prev,
          error: errorMessage,
          isLoadingList: false,
        }));
        throw error;
      }
    },
    []
  );

  /**
   * Obtener valores por defecto
   */
  const fetchDefaults = useCallback(async () => {
    setState(prev => ({ ...prev, isLoadingDefaults: true, error: null }));
    try {
      const defaults = await attendanceConfigService.getDefaults();
      setState(prev => ({
        ...prev,
        defaults,
        isLoadingDefaults: false,
      }));
      return defaults;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoadingDefaults: false,
      }));
      throw error;
    }
  }, []);

  /**
   * Crear nueva configuración
   */
  const create = useCallback(async (config: CreateAttendanceConfigDto) => {
    setState(prev => ({ ...prev, isCreating: true, error: null, validationErrors: null }));
    try {
      const newConfig = await attendanceConfigService.createConfig(config);
      setState(prev => ({
        ...prev,
        configs: [newConfig, ...prev.configs],
        isCreating: false,
      }));
      return newConfig;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isCreating: false,
      }));
      throw error;
    }
  }, []);

  /**
   * Actualizar configuración
   */
 const update = useCallback(
  async (configId: number, updates: UpdateAttendanceConfigDto) => {
    setState(prev => ({ ...prev, isUpdating: true, error: null, validationErrors: null }));
    try {
      const updatedConfig = await attendanceConfigService.updateConfig(configId, updates);
      setState(prev => ({
        ...prev,
        configs: prev.configs?.map(c => c.id === configId ? updatedConfig : c) || [],
        activeConfig: prev.activeConfig?.id === configId ? updatedConfig : prev.activeConfig,
        isUpdating: false,
      }));
      return updatedConfig;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isUpdating: false,
      }));
      throw error;
    }
  },
  []
);

// En deactivate
const deactivate = useCallback(async (configId: number) => {
  setState(prev => ({ ...prev, isDeleting: true, error: null }));
  try {
    const deactivatedConfig = await attendanceConfigService.deactivateConfig(configId);
    setState(prev => ({
      ...prev,
      configs: prev.configs?.map(c => c.id === configId ? deactivatedConfig : c) || [],
      isDeleting: false,
    }));
    return deactivatedConfig;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    setState(prev => ({
      ...prev,
      error: errorMessage,
      isDeleting: false,
    }));
    throw error;
  }
}, []);

// En activate
const activate = useCallback(async (configId: number) => {
  setState(prev => ({ ...prev, isUpdating: true, error: null }));
  try {
    const activatedConfig = await attendanceConfigService.activateConfig(configId);
    setState(prev => ({
      ...prev,
      configs: prev.configs?.map(c => ({
        ...c,
        isActive: c.id === configId,
      })) || [],
      activeConfig: activatedConfig,
      isUpdating: false,
    }));
    return activatedConfig;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    setState(prev => ({
      ...prev,
      error: errorMessage,
      isUpdating: false,
    }));
    throw error;
  }
}, []);
 

  /**
   * Resetear a valores por defecto
   */
  const resetDefaults = useCallback(async () => {
    setState(prev => ({ ...prev, isUpdating: true, error: null }));
    try {
      const resetConfig = await attendanceConfigService.resetToDefaults();
      setState(prev => ({
        ...prev,
        activeConfig: resetConfig,
        configs: prev.configs.map(c => c.id === resetConfig.id ? resetConfig : c),
        isUpdating: false,
      }));
      return resetConfig;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isUpdating: false,
      }));
      throw error;
    }
  }, []);

  /**
   * Limpiar error
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null, validationErrors: null }));
  }, []);

  /**
   * Resetear estado
   */
  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    // Estado
    ...state,

    // Métodos de obtención
    fetchActiveConfig,
    fetchConfigs,
    fetchDefaults,

    // Métodos CRUD
    create,
    update,
    deactivate,
    activate,
    resetDefaults,

    // Utilidades
    clearError,
    reset,

    // Validaciones
    isValidTimeFormat: attendanceConfigService.isValidTimeFormat,
    isValidPercentage: attendanceConfigService.isValidPercentage,
    isValidMinutes: attendanceConfigService.isValidMinutes,
  };
};

/**
 * Hook para obtener solo la configuración activa
 * Más simple si solo necesitas la config activa
 * 
 * @param {boolean} autoFetch - Obtener automáticamente al montar (default: true)
 * @returns {Object} Config activa y métodos
 * 
 * @example
 * const { config, loading, error } = useActiveAttendanceConfig();
 */
export const useActiveAttendanceConfig = (autoFetch: boolean = true) => {
  const { activeConfig, isLoadingActive, error, fetchActiveConfig } = useAttendanceConfig();

  useEffect(() => {
    if (autoFetch && !activeConfig) {
      fetchActiveConfig();
    }
  }, [autoFetch, activeConfig, fetchActiveConfig]);

  return {
    config: activeConfig,
    loading: isLoadingActive,
    error,
    refetch: fetchActiveConfig,
  };
};

/**
 * Hook para obtener lista de configuraciones
 * 
 * @param {AttendanceConfigQueryParams} params - Parámetros de búsqueda
 * @param {boolean} autoFetch - Obtener automáticamente al montar (default: true)
 * @returns {Object} Lista y métodos
 * 
 * @example
 * const { configs, loading, pagination } = useAttendanceConfigs({ page: 1, limit: 10 });
 */
export const useAttendanceConfigs = (
  params: AttendanceConfigQueryParams = {},
  autoFetch: boolean = true
) => {
  const { configs, isLoadingList, pagination, error, fetchConfigs } = useAttendanceConfig();

  useEffect(() => {
    if (autoFetch) {
      fetchConfigs(params);
    }
  }, [autoFetch, params, fetchConfigs]);

  return {
    configs,
    loading: isLoadingList,
    pagination,
    error,
    refetch: (newParams?: AttendanceConfigQueryParams) => fetchConfigs(newParams || params),
  };
};

/**
 * Hook para valores por defecto
 * 
 * @param {boolean} autoFetch - Obtener automáticamente al montar (default: true)
 * @returns {Object} Valores por defecto y métodos
 * 
 * @example
 * const { defaults, loading } = useAttendanceConfigDefaults();
 */
export const useAttendanceConfigDefaults = (autoFetch: boolean = true) => {
  const { defaults, isLoadingDefaults, error, fetchDefaults } = useAttendanceConfig();

  useEffect(() => {
    if (autoFetch && !defaults) {
      fetchDefaults();
    }
  }, [autoFetch, defaults, fetchDefaults]);

  return {
    defaults,
    loading: isLoadingDefaults,
    error,
    refetch: fetchDefaults,
  };
};

export default useAttendanceConfig;