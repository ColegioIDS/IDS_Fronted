// src/services/attendanceConfigService.ts

import apiClient from './api';
import {
  AttendanceConfig,
  AttendanceConfigDefaults,
  CreateAttendanceConfigDto,
  UpdateAttendanceConfigDto,
  AttendanceConfigQueryParams,
  AttendanceConfigListResponse,
  ActiveAttendanceConfig,
  AttendanceConfigError,
  AttendanceConfigErrorType,
} from '@/types/attendanceConfig';
import { ApiResponse } from '@/types/api';

/**
 * Servicio de Configuración de Asistencia
 * Gestiona todas las operaciones relacionadas con la configuración del sistema de asistencia
 * 
 * Endpoints disponibles:
 * - GET  api/attendance-config/active          → Obtener configuración activa
 * - GET  api/attendance-config                 → Listar todas las configuraciones
 * - GET  api/attendance-config/defaults/values → Obtener valores por defecto
 * - GET  api/attendance-config/:id             → Obtener configuración por ID
 * - POST api/attendance-config                 → Crear nueva configuración
 * - PUT  api/attendance-config/:id             → Actualizar configuración
 * - DELETE api/attendance-config/:id           → Desactivar configuración
 */

export const attendanceConfigService = {
  /**
   * Obtener la configuración de asistencia activa
   * Esta es la configuración principal del sistema
   * 
   * @returns {Promise<AttendanceConfig>} Configuración activa
   * 
   * @example
   * const config = await attendanceConfigService.getActiveConfig();
   * console.log(config.riskThresholdPercentage); // 80.0
   * 
   * @throws {AttendanceConfigError} Si no existe configuración activa
   * 
   * @response
   * {
   *   "id": 1,
   *   "negativeStatusCodes": ["I", "TI"],
   *   "riskThresholdPercentage": 80.0,
   *   "consecutiveAbsenceAlert": 3,
   *   "notesRequiredForStates": ["IJ", "TJ"],
   *   "defaultNotesPlaceholder": "Ingrese el motivo de la ausencia",
   *   "lateThresholdTime": "08:30",
   *   "markAsTardyAfterMinutes": 15,
   *   "justificationRequiredAfter": 3,
   *   "maxJustificationDays": 365,
   *   "autoApproveJustification": false,
   *   "autoApprovalAfterDays": 7,
   *   "isActive": true,
   *   "createdAt": "2024-01-15T10:00:00Z",
   *   "updatedAt": "2024-01-15T10:00:00Z"
   * }
   */
  getActiveConfig: async (): Promise<AttendanceConfig> => {
    try {
      const { data } = await apiClient.get<ApiResponse<AttendanceConfig>>(
        'api/attendance-config/active'
      );
      return data.data;
    } catch (error) {
      throw handleAttendanceConfigError(error);
    }
  },

  /**
   * Obtener todas las configuraciones de asistencia con paginación
   * 
   * @param {AttendanceConfigQueryParams} params - Parámetros de búsqueda y paginación
   * @param {number} params.page - Número de página (default: 1)
   * @param {number} params.limit - Registros por página (default: 10, max: 100)
   * @param {boolean} params.isActive - Filtrar por estado activo (opcional)
   * 
   * @returns {Promise<AttendanceConfigListResponse>} Lista de configuraciones y metadatos
   * 
   * @example
   * const response = await attendanceConfigService.listConfigs({
   *   page: 1,
   *   limit: 10,
   *   isActive: true
   * });
   * console.log(response.data); // Array de configuraciones
   * console.log(response.meta); // { total: 1, page: 1, ... }
   * 
   * @response
   * {
   *   "data": [
   *     {
   *       "id": 1,
   *       "negativeStatusCodes": ["I", "TI"],
   *       "riskThresholdPercentage": 80.0,
   *       ...
   *     }
   *   ],
   *   "meta": {
   *     "total": 1,
   *     "page": 1,
   *     "limit": 10,
   *     "totalPages": 1,
   *     "hasNextPage": false,
   *     "hasPreviousPage": false
   *   }
   * }
   */
  listConfigs: async (
    params: AttendanceConfigQueryParams = {}
  ): Promise<AttendanceConfigListResponse> => {
    try {
      const queryString = new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null) {
            acc[key] = String(value);
          }
          return acc;
        }, {} as Record<string, string>)
      ).toString();

      const url = queryString 
        ? `api/attendance-config?${queryString}`
        : 'api/attendance-config';

      const { data } = await apiClient.get<ApiResponse<AttendanceConfigListResponse>>(url);
      return data.data;
    } catch (error) {
      throw handleAttendanceConfigError(error);
    }
  },

  /**
   * Obtener los valores por defecto del sistema
   * Retorna los valores iniciales sin persistencia
   * 
   * @returns {Promise<AttendanceConfigDefaults>} Valores por defecto
   * 
   * @example
   * const defaults = await attendanceConfigService.getDefaults();
   * console.log(defaults.riskThresholdPercentage); // 80.0
   * 
   * @response
   * {
   *   "negativeStatusCodes": ["I", "TI"],
   *   "riskThresholdPercentage": 80.0,
   *   "consecutiveAbsenceAlert": 3,
   *   "notesRequiredForStates": ["IJ", "TJ"],
   *   "defaultNotesPlaceholder": null,
   *   "lateThresholdTime": "08:30",
   *   "markAsTardyAfterMinutes": 15,
   *   "justificationRequiredAfter": 3,
   *   "maxJustificationDays": 365,
   *   "autoApproveJustification": false,
   *   "autoApprovalAfterDays": 7
   * }
   */
  getDefaults: async (): Promise<AttendanceConfigDefaults> => {
    try {
      const { data } = await apiClient.get<ApiResponse<AttendanceConfigDefaults>>(
        'api/attendance-config/defaults/values'
      );
      return data.data;
    } catch (error) {
      throw handleAttendanceConfigError(error);
    }
  },

  /**
   * Obtener una configuración específica por ID
   * 
   * @param {number} configId - ID de la configuración
   * @returns {Promise<AttendanceConfig>} Configuración solicitada
   * 
   * @example
   * const config = await attendanceConfigService.getConfigById(1);
   * console.log(config.lateThresholdTime); // "08:30"
   * 
   * @throws {AttendanceConfigError} Si la configuración no existe (404)
   * 
   * @response
   * {
   *   "id": 1,
   *   "negativeStatusCodes": ["I", "TI"],
   *   "riskThresholdPercentage": 80.0,
   *   ...
   * }
   */
  getConfigById: async (configId: number): Promise<AttendanceConfig> => {
    try {
      const { data } = await apiClient.get<ApiResponse<AttendanceConfig>>(
        `api/attendance-config/${configId}`
      );
      return data.data;
    } catch (error) {
      throw handleAttendanceConfigError(error);
    }
  },

  /**
   * Crear una nueva configuración de asistencia
   * Si isActive es true, desactiva automáticamente todas las demás
   * 
   * @param {CreateAttendanceConfigDto} config - Datos de la nueva configuración
   * @returns {Promise<AttendanceConfig>} Configuración creada
   * 
   * @example
   * const newConfig = await attendanceConfigService.createConfig({
   *   negativeStatusCodes: ["I", "TI"],
   *   riskThresholdPercentage: 75.0,
   *   lateThresholdTime: "09:00",
   *   markAsTardyAfterMinutes: 20,
   *   isActive: true
   * });
   * 
   * @throws {AttendanceConfigError} Si la validación falla
   * 
   * @validation
   * - riskThresholdPercentage: 0-100
   * - lateThresholdTime: Formato HH:MM válido
   * - markAsTardyAfterMinutes: 1-120
   * - justificationRequiredAfter: >= 1
   * - maxJustificationDays: >= justificationRequiredAfter
   * 
   * @response
   * {
   *   "id": 2,
   *   "negativeStatusCodes": ["I", "TI"],
   *   "riskThresholdPercentage": 75.0,
   *   "lateThresholdTime": "09:00",
   *   "markAsTardyAfterMinutes": 20,
   *   "isActive": true,
   *   "createdAt": "2024-01-16T10:00:00Z",
   *   "updatedAt": "2024-01-16T10:00:00Z",
   *   ...
   * }
   */
  createConfig: async (
    config: CreateAttendanceConfigDto
  ): Promise<AttendanceConfig> => {
    try {
      const { data } = await apiClient.post<ApiResponse<AttendanceConfig>>(
        'api/attendance-config',
        config
      );
      return data.data;
    } catch (error) {
      throw handleAttendanceConfigError(error);
    }
  },

  /**
   * Actualizar una configuración existente
   * Solo actualiza los campos proporcionados
   * 
   * @param {number} configId - ID de la configuración a actualizar
   * @param {UpdateAttendanceConfigDto} updates - Campos a actualizar
   * @returns {Promise<AttendanceConfig>} Configuración actualizada
   * 
   * @example
   * const updatedConfig = await attendanceConfigService.updateConfig(1, {
   *   riskThresholdPercentage: 85.0,
   *   markAsTardyAfterMinutes: 20
   * });
   * 
   * @throws {AttendanceConfigError} Si la validación falla o no existe
   * 
   * @validation
   * Los mismos validadores que createConfig aplican a los campos actualizados
   * 
   * @response
   * {
   *   "id": 1,
   *   "negativeStatusCodes": ["I", "TI"],
   *   "riskThresholdPercentage": 85.0,
   *   "markAsTardyAfterMinutes": 20,
   *   "updatedAt": "2024-01-16T11:00:00Z",
   *   ...
   * }
   */
  updateConfig: async (
    configId: number,
    updates: UpdateAttendanceConfigDto
  ): Promise<AttendanceConfig> => {
    try {
      const { data } = await apiClient.put<ApiResponse<AttendanceConfig>>(
        `api/attendance-config/${configId}`,
        updates
      );
      return data.data;
    } catch (error) {
      throw handleAttendanceConfigError(error);
    }
  },

  /**
   * Desactivar una configuración
   * No elimina la configuración, solo la marca como inactiva
   * 
   * @param {number} configId - ID de la configuración a desactivar
   * @returns {Promise<AttendanceConfig>} Configuración desactivada
   * 
   * @example
   * const deactivatedConfig = await attendanceConfigService.deactivateConfig(1);
   * console.log(deactivatedConfig.isActive); // false
   * 
   * @throws {AttendanceConfigError} Si no existe o ya estaba inactiva
   * 
   * @response
   * {
   *   "id": 1,
   *   "negativeStatusCodes": ["I", "TI"],
   *   "riskThresholdPercentage": 80.0,
   *   "isActive": false,
   *   "updatedAt": "2024-01-16T12:00:00Z",
   *   ...
   * }
   */
  deactivateConfig: async (configId: number): Promise<AttendanceConfig> => {
    try {
      const { data } = await apiClient.delete<ApiResponse<AttendanceConfig>>(
        `api/attendance-config/${configId}`
      );
      return data.data;
    } catch (error) {
      throw handleAttendanceConfigError(error);
    }
  },

  /**
   * Activar una configuración existente
   * Desactiva automáticamente todas las demás
   * 
   * @param {number} configId - ID de la configuración a activar
   * @returns {Promise<AttendanceConfig>} Configuración activada
   * 
   * @example
   * const activatedConfig = await attendanceConfigService.activateConfig(2);
   * console.log(activatedConfig.isActive); // true
   * 
   * @throws {AttendanceConfigError} Si no existe
   * 
   * @response
   * {
   *   "id": 2,
   *   "isActive": true,
   *   "updatedAt": "2024-01-16T12:30:00Z",
   *   ...
   * }
   */
  activateConfig: async (configId: number): Promise<AttendanceConfig> => {
    try {
      const { data } = await apiClient.put<ApiResponse<AttendanceConfig>>(
        `api/attendance-config/${configId}`,
        { isActive: true }
      );
      return data.data;
    } catch (error) {
      throw handleAttendanceConfigError(error);
    }
  },

  /**
   * Resetear configuración a valores por defecto
   * Actualiza la configuración activa con los valores por defecto
   * 
   * @returns {Promise<AttendanceConfig>} Configuración con valores por defecto
   * 
   * @example
   * const resetConfig = await attendanceConfigService.resetToDefaults();
   * 
   * @throws {AttendanceConfigError} Si no existe configuración activa
   * 
   * @response
   * {
   *   "id": 1,
   *   "negativeStatusCodes": ["I", "TI"],
   *   "riskThresholdPercentage": 80.0,
   *   "lateThresholdTime": "08:30",
   *   "markAsTardyAfterMinutes": 15,
   *   ...
   * }
   */
  resetToDefaults: async (): Promise<AttendanceConfig> => {
    try {
      const defaults = await attendanceConfigService.getDefaults();
      const activeConfig = await attendanceConfigService.getActiveConfig();
      
      return attendanceConfigService.updateConfig(activeConfig.id, defaults);
    } catch (error) {
      throw handleAttendanceConfigError(error);
    }
  },

  /**
   * Validar que un valor de tiempo está en formato HH:MM
   * 
   * @param {string} time - Tiempo en formato HH:MM
   * @returns {boolean} True si es válido
   * 
   * @example
   * attendanceConfigService.isValidTimeFormat("08:30"); // true
   * attendanceConfigService.isValidTimeFormat("25:00"); // false
   */
  isValidTimeFormat: (time: string): boolean => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  },

  /**
   * Validar que un porcentaje está en el rango válido (0-100)
   * 
   * @param {number} percentage - Porcentaje a validar
   * @returns {boolean} True si es válido
   * 
   * @example
   * attendanceConfigService.isValidPercentage(80); // true
   * attendanceConfigService.isValidPercentage(150); // false
   */
  isValidPercentage: (percentage: number): boolean => {
    return percentage >= 0 && percentage <= 100;
  },

  /**
   * Validar que minutos de tardanza están en el rango válido (1-120)
   * 
   * @param {number} minutes - Minutos a validar
   * @returns {boolean} True si es válido
   * 
   * @example
   * attendanceConfigService.isValidMinutes(15); // true
   * attendanceConfigService.isValidMinutes(200); // false
   */
  isValidMinutes: (minutes: number): boolean => {
    return minutes >= 1 && minutes <= 120;
  },

  /**
   * Obtener una copia formateada de la configuración para mostrar en UI
   * 
   * @param {AttendanceConfig} config - Configuración a formatear
   * @returns {AttendanceConfig} Configuración formateada
   * 
   * @example
   * const formatted = attendanceConfigService.formatForDisplay(config);
   */
  formatForDisplay: (config: AttendanceConfig): AttendanceConfig => {
    return {
      ...config,
      defaultNotesPlaceholder: config.defaultNotesPlaceholder || 'N/A',
    };
  },
};

/**
 * Manejador de errores de AttendanceConfig
 * Convierte errores HTTP en errores tipados de AttendanceConfig
 * 
 * @param {any} error - Error a manejar
 * @returns {AttendanceConfigError} Error tipado
 * 
 * @internal
 */
const handleAttendanceConfigError = (error: any): AttendanceConfigError => {
  const configError = new Error() as AttendanceConfigError;

  if (error.response) {
    const { status, data } = error.response;

    configError.statusCode = status;
    configError.message = data?.message || `HTTP Error ${status}`;

    // Determinar el tipo de error
    switch (status) {
      case 400:
        configError.type = AttendanceConfigErrorType.VALIDATION_ERROR;
        if (data?.message?.includes('time format')) {
          configError.type = AttendanceConfigErrorType.INVALID_TIME_FORMAT;
        } else if (data?.message?.includes('percentage')) {
          configError.type = AttendanceConfigErrorType.INVALID_PERCENTAGE;
        }
        break;

      case 404:
        configError.type = AttendanceConfigErrorType.NOT_FOUND;
        configError.message = 'Configuración no encontrada';
        break;

      case 409:
        configError.type = AttendanceConfigErrorType.CONFLICT;
        configError.message = data?.message || 'Conflicto en la configuración';
        break;

      default:
        configError.type = AttendanceConfigErrorType.UNKNOWN;
    }

    configError.details = data?.details || null;
  } else if (error.request) {
    configError.type = AttendanceConfigErrorType.UNKNOWN;
    configError.message = 'No response from server';
  } else {
    configError.type = AttendanceConfigErrorType.UNKNOWN;
    configError.message = error.message || 'Unknown error';
  }

  return configError;
};

export default attendanceConfigService;