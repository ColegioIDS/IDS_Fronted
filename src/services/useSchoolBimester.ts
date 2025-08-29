//src\services\useSchoolBimester.ts
import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '@/config/api';
import { Bimester, SchoolBimesterPayload } from '@/types/SchoolBimesters';
import { ApiResponse } from '@/types/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Obtiene todos los bimestres de un ciclo escolar específico
 * @param cycleId ID del ciclo escolar
 * @returns Lista de bimestres
 */
export const getBimestersByCycle = async (cycleId: number): Promise<Bimester[]> => {
  try {
    const { data } = await apiClient.get<ApiResponse<Bimester[]>>(
      `api/school-cycles/${cycleId}/bimesters`
    );

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener los bimestres');
    }

    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener los bimestres');
  }
};

/**
 * Crea un nuevo bimestre en un ciclo escolar
 * @param cycleId ID del ciclo escolar (siempre 1 según tu endpoint)
 * @param bimesterData Datos del bimestre a crear
 * @returns El bimestre creado
 */
export const createBimester = async (
  cycleId: number,
  bimesterData: SchoolBimesterPayload
): Promise<Bimester> => {
  try {
    // Asegurarnos de que el cycleId en los datos coincida
    const payload = { ...bimesterData };

    const { data } = await apiClient.post<ApiResponse<Bimester>>(
      `api/school-cycles/${cycleId}/bimesters`,
      payload
    );

    if (!data.success) {
      const error = new Error(data.message || 'Error al crear el bimestre');
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
 * Actualiza un bimestre existente
 * @param bimesterId ID del bimestre a actualizar
 * @param updateData Datos a actualizar
 * @returns El bimestre actualizado
 */
export const updateBimester = async (
  bimesterId: number,
  updateData: Partial<SchoolBimesterPayload>
): Promise<Bimester> => {
  try {
    const { data } = await apiClient.patch<ApiResponse<Bimester>>(
      `api/school-cycles/bimesters/${bimesterId}`,
      updateData
    );

    if (!data.success) {
      const error = new Error(data.message || 'Error al actualizar el bimestre');
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