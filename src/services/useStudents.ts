//src\services\useStudents.ts
import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '@/config/api';
import { Student, CreateStudentPayload, ParentDpiResponse, StudentTransferPayload, Enrollment,
  EnrollmentFormData, 
  GradeWithSections,
  SectionsAvailability 
 } from '@/types/student';
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
      const error = new Error(data.message || 'Error al crear el estudiante');
      (error as any).details = data.details ?? [];
      throw error;
    }

    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al crear el estudiante');
  }
};

// ✅ ACTUALIZADO: Manejo del response actualizado del backend
export const getUserByDPI = async (dpi: string): Promise<ParentDpiResponse | null> => {
  try {
    // ✅ El backend ahora retorna directamente ParentDpiResponse, no envuelto en ApiResponse
    const { data } = await apiClient.get<ParentDpiResponse>(`/api/students/dpi/${dpi}`);

    if (!data.success) {
      if (data.data === null) return null;
      throw new Error('Error al obtener el usuario por DPI');
    }

    return data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null; // Usuario no encontrado
    }
    handleApiError(error, 'Error al obtener el usuario por DPI');
    return null;
  }
};

export const getStudentById = async (userId: number): Promise<Student | null> => {
  try {
    const { data } = await apiClient.get<ApiResponse<Student>>(`/api/students/${userId}`);

    if (!data.success) {
      if (data.message === 'Student not found') return null;
      throw new Error(data.message || 'Error al obtener el estudiante');
    }

    return data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null; // Estudiante no encontrado
    }
    handleApiError(error, 'Error al obtener el estudiante');
  }
};

// ✅ NUEVO: Obtener enrollment activo de un estudiante
export const getActiveEnrollment = async (studentId: number, cycleId: number): Promise<Enrollment | null> => {
  try {
    const { data } = await apiClient.get<ApiResponse<Enrollment>>(`/api/students/${studentId}/enrollment/cycle/${cycleId}`);

    if (!data.success) {
      return null;
    }

    return data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null; // Enrollment no encontrado
    }
    handleApiError(error, 'Error al obtener el enrollment del estudiante');
  }
};

// ✅ NUEVO: Transferir estudiante a otra sección
export const transferStudent = async (studentId: number, transferData: StudentTransferPayload): Promise<Enrollment> => {
  try {
    const { data } = await apiClient.post<ApiResponse<Enrollment>>(`/api/students/${studentId}/transfer`, transferData);

    if (!data.success) {
      const error = new Error(data.message || 'Error al transferir el estudiante');
      (error as any).details = data.details ?? [];
      throw error;
    }

    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al transferir el estudiante');
  }
};

// ✅ NUEVO: Actualizar estudiante (método que faltaba)
export const updateStudent = async (studentId: number, studentData: Partial<Student>): Promise<Student> => {
  try {
    const { data } = await apiClient.put<ApiResponse<Student>>(`/api/students/${studentId}`, studentData);

    if (!data.success) {
      const error = new Error(data.message || 'Error al actualizar el estudiante');
      (error as any).details = data.details ?? [];
      throw error;
    }

    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al actualizar el estudiante');
  }
};

// ✅ NUEVO: Eliminar estudiante
export const deleteStudent = async (studentId: number): Promise<void> => {
  try {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/api/students/${studentId}`);

    if (!data.success) {
      throw new Error(data.message || 'Error al eliminar el estudiante');
    }
  } catch (error) {
    handleApiError(error, 'Error al eliminar el estudiante');
  }
};


// ✅ NUEVO: Obtener datos completos para el formulario de inscripción
export const getEnrollmentData = async (): Promise<EnrollmentFormData> => {
  try {
    const { data } = await apiClient.get<ApiResponse<EnrollmentFormData>>('/api/students/enrollment/data');

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener datos de inscripción');
    }

    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener datos de inscripción');
  }
};

// ✅ NUEVO: Obtener grados disponibles para un ciclo específico
export const getGradesByCycle = async (cycleId: number): Promise<GradeWithSections> => {
  try {
    const { data } = await apiClient.get<ApiResponse<GradeWithSections>>(
      `/api/students/enrollment/cycles/${cycleId}/grades`
    );

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener grados del ciclo');
    }

    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener grados del ciclo');
  }
};

// ✅ NUEVO: Obtener secciones disponibles de un grado en un ciclo
export const getSectionsByGradeAndCycle = async (
  cycleId: number, 
  gradeId: number
): Promise<SectionsAvailability> => {
  try {
    const { data } = await apiClient.get<ApiResponse<SectionsAvailability>>(
      `/api/students/enrollment/cycles/${cycleId}/grades/${gradeId}/sections`
    );

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener secciones');
    }

    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener secciones');
  }
};

// Exportar todo junto
export const studentEnrollmentService = {
  getEnrollmentData,
  getGradesByCycle,
  getSectionsByGradeAndCycle,
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