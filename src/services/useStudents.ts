//src\services\useStudents.ts
import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '@/config/api';
import { Student, CreateStudentPayload, ParentDpiResponse  } from '@/types/student';
import { ApiResponse } from '@/types/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getStudents = async (): Promise<Student[]> => {
  try {
    const { data } = await apiClient.get<ApiResponse<Student[]>>('/api/students');

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener los estudiantes');
    }

    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener los estudiantes');
  }
};
export const createStudent = async (student: CreateStudentPayload): Promise<Student> => {
  try {
    const { data } = await apiClient.post<ApiResponse<Student>>('/api/students', student);

    if (!data.success) {
      const error = new Error(data.message || 'Error al crear el usuario');
      (error as any).details = data.details ?? [];
      throw error;
    }

    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al crear el usuario');
  }
};



export const getUserByDPI = async (dpi: string): Promise<ParentDpiResponse | null> => {
  try {
    const { data } = await apiClient.get<ApiResponse<ParentDpiResponse>>(`/api/students/dpi/${dpi}`);

    if (!data.success) {
      if (data.message === 'User not found') return null;
      throw new Error(data.message || 'Error al obtener el usuario');
    }

    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener el usuario');
    return null;
  }
};

export const getStudentById = async (userId: number): Promise<Student | null> => {
  try {
    const { data } = await apiClient.get<ApiResponse<Student>>(`/api/students/${userId}`);

    if (!data.success) {
      if (data.message === 'User not found') return null;
      throw new Error(data.message || 'Error al obtener el usuario');
    }

    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener el usuario');
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
