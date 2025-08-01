import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '@/config/api';
import { SchoolCycle, SchoolCyclePayload } from '@/types/SchoolCycle'
import { ApiResponse } from '@/types/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getSchoolCycles = async (): Promise<SchoolCycle[]> => {
  try {
    const { data } = await apiClient.get<ApiResponse<SchoolCycle[]>>('/api/school-cycles');

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener los datos');
    }

    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener los datos');
  }
};

export const createCycle = async (cycleData: SchoolCyclePayload): Promise<SchoolCycle> => {
  try {
    const { data } = await apiClient.post<ApiResponse<SchoolCycle>>('/api/school-cycles', cycleData);

    if (!data.success) {
      // Mantenemos toda la estructura del error del backend
      const error = new Error(data.message || 'Error al crear el Ciclo Escolar');
      (error as any).response = { data }; // Conservamos toda la respuesta
      throw error;
    }

    return data.data;
  } catch (error) {
    // Modificamos handleApiError para que no pierda la estructura original
    if (axios.isAxiosError(error)) {
      // Si es un error de Axios, lo dejamos pasar con toda su información
      throw error;
    }
    throw error; // Ya debería ser un Error con la estructura adecuada
  }
};

export const updateCycle = async (
  id: string | number,
  cycleData: SchoolCyclePayload
): Promise<SchoolCycle> => {
  try {
    const { data } = await apiClient.patch<ApiResponse<SchoolCycle>>(
      `/api/school-cycles/${id}`,
      cycleData
    );

    if (!data.success) {
      const error = new Error(data.message || 'Error al actualizar el Ciclo Escolar');
      (error as any).details = data.details ?? [];
      throw error;
    }

    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al actualizar el Ciclo Escolar');
  }
};





// Función reutilizable para manejar errores
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
