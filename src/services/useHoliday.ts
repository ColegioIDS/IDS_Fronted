// src/services/holidayService.ts
import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '@/config/api';
import { ApiResponse } from '@/types/api';
import {
  Holiday,
  CreateHolidayPayload,
  UpdateHolidayPayload
} from '@/types/holiday';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Obtiene todos los días festivos
 * @returns Lista de días festivos
 */
export const getAllHolidays = async (): Promise<Holiday[]> => {
  try {
    const { data } = await apiClient.get<ApiResponse<Holiday[]>>(
      'api/holidays'
    );

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener los días festivos');
    }

    return data.data;
  } catch (error) {
    return handleApiError(error, 'Error al obtener los días festivos');
  }
};

/**
 * Filtra días festivos por ciclo y/o bimestre
 * @param params Parámetros de filtrado
 * @returns Lista de días festivos filtrados
 */
export const filterHolidays = async (
  params: { cycleId?: number; bimesterId?: number }
): Promise<Holiday[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params.cycleId) queryParams.append('cycleId', params.cycleId.toString());
    if (params.bimesterId) queryParams.append('bimesterId', params.bimesterId.toString());

    const { data } = await apiClient.get<ApiResponse<Holiday[]>>(
      `api/holidays/filter/by-cycle-and-bimester?${queryParams}`
    );

    if (!data.success) {
      throw new Error(data.message || 'Error al filtrar días festivos');
    }

    return data.data;
  } catch (error) {
    return handleApiError(error, 'Error al filtrar días festivos');
  }
};

/**
 * Crea un nuevo día festivo
 * @param holidayData Datos del día festivo
 * @returns El día festivo creado
 */
export const createHoliday = async (
  holidayData: CreateHolidayPayload
): Promise<Holiday> => {
  try {
    const { data } = await apiClient.post<ApiResponse<Holiday>>(
      'api/holidays',
      holidayData
    );

    if (!data.success) {
      const error = new Error(data.message || 'Error al crear el día festivo');
      (error as any).response = { data };
      throw error;
    }

    return data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
    throw error;
  }
};

/**
 * Actualiza un día festivo existente
 * @param holidayId ID del día festivo
 * @param updateData Datos a actualizar
 * @returns El día festivo actualizado
 */
export const updateHoliday = async (
  holidayId: number,
  updateData: UpdateHolidayPayload
): Promise<Holiday> => {
  try {
    const { data } = await apiClient.patch<ApiResponse<Holiday>>(
      `api/holidays/${holidayId}`,
      updateData
    );

    if (!data.success) {
      const error = new Error(data.message || 'Error al actualizar el día festivo');
      (error as any).response = { data };
      throw error;
    }

    return data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
    throw error;
  }
};

/**
 * Elimina un día festivo
 * @param holidayId ID del día festivo a eliminar
 * @returns Mensaje de confirmación
 */
export const deleteHoliday = async (
  holidayId: number
): Promise<{ message: string }> => {
  try {
    const { data } = await apiClient.delete<ApiResponse<{ message: string }>>(
      `api/holidays/${holidayId}`
    );

    if (!data.success) {
      throw new Error(data.message || 'Error al eliminar el día festivo');
    }

    return data.data;
  } catch (error) {
    return handleApiError(error, 'Error al eliminar el día festivo');
  }
};

// Función reutilizable para manejar errores (igual que en tu servicio original)
function handleApiError(error: unknown, fallbackMessage: string): never {
  if (axios.isAxiosError(error)) {
    const message =
      error.response?.data?.message || error.message || fallbackMessage;
    const details = error.response?.data?.details || [];

    const err = new Error(message);
    (err as any).details = details;
    throw err;
  }

  if (error instanceof Error) {
    throw error;
  }

  throw new Error(fallbackMessage);
}