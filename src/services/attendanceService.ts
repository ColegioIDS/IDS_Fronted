// src/services/attendanceService.ts
import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '@/config/api';
import { 
  Attendance, 
  CreateAttendanceRequest, 
  UpdateAttendanceRequest,
  AttendanceFilters,
  AttendanceResponse,
  AttendanceStats
} from '@/types/attendance.types';
import { ApiResponse } from '@/types/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== ATTENDANCE ====================

export const getAttendances = async (filters?: AttendanceFilters): Promise<AttendanceResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const url = params.toString() ? `/api/attendance?${params.toString()}` : '/api/attendance';
    const { data } = await apiClient.get<AttendanceResponse>(url);
    return data;
  } catch (error) {
    handleApiError(error, 'Error al obtener asistencias');
  }
};

export const getAttendanceById = async (id: number): Promise<Attendance> => {
  try {
    const { data } = await apiClient.get<ApiResponse<Attendance>>(`/api/attendance/${id}`);
    if (!data.success) throw new Error(data.message || 'Error al obtener la asistencia');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener la asistencia');
  }
};

export const getAttendancesByStudent = async (
  studentId: number, 
  filters?: Omit<AttendanceFilters, 'studentId'>
): Promise<AttendanceResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const url = params.toString() 
      ? `/api/attendance/by-student/${studentId}?${params.toString()}`
      : `/api/attendance/by-student/${studentId}`;
    
    const { data } = await apiClient.get<AttendanceResponse>(url);
    return data;
  } catch (error) {
    handleApiError(error, 'Error al obtener asistencias del estudiante');
  }
};

export const getAttendancesByEnrollment = async (
  enrollmentId: number,
  filters?: Omit<AttendanceFilters, 'enrollmentId'>
): Promise<AttendanceResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const url = params.toString() 
      ? `/api/attendance/by-enrollment/${enrollmentId}?${params.toString()}`
      : `/api/attendance/by-enrollment/${enrollmentId}`;
    
    const { data } = await apiClient.get<AttendanceResponse>(url);
    return data;
  } catch (error) {
    handleApiError(error, 'Error al obtener asistencias de la matrícula');
  }
};

export const getAttendancesByBimester = async (
  bimesterId: number,
  filters?: Omit<AttendanceFilters, 'bimesterId'>
): Promise<AttendanceResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const url = params.toString() 
      ? `/api/attendance/by-bimester/${bimesterId}?${params.toString()}`
      : `/api/attendance/by-bimester/${bimesterId}`;
    
    const { data } = await apiClient.get<AttendanceResponse>(url);
    return data;
  } catch (error) {
    handleApiError(error, 'Error al obtener asistencias del bimestre');
  }
};

export const getAttendanceStats = async (enrollmentId: number, bimesterId?: number): Promise<AttendanceStats> => {
  try {
    const url = bimesterId 
      ? `/api/attendance/stats/${enrollmentId}?bimesterId=${bimesterId}`
      : `/api/attendance/stats/${enrollmentId}`;
    
    const { data } = await apiClient.get<ApiResponse<AttendanceStats>>(url);
    if (!data.success) throw new Error(data.message || 'Error al obtener estadísticas de asistencia');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener estadísticas de asistencia');
  }
};

export const createAttendance = async (attendanceData: CreateAttendanceRequest): Promise<Attendance> => {
  try {
    const { data } = await apiClient.post<ApiResponse<Attendance>>('/api/attendance', attendanceData);
    if (!data.success) {
      const error = new Error(data.message || 'Error al crear asistencia');
      (error as any).details = data.details ?? [];
      throw error;
    }
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al crear asistencia');
  }
};

export const createBulkAttendance = async (attendanceData: CreateAttendanceRequest[]): Promise<Attendance[]> => {
  try {
    const { data } = await apiClient.post<ApiResponse<Attendance[]>>('/api/attendance/bulk', attendanceData);
    if (!data.success) {
      const error = new Error(data.message || 'Error al crear asistencias múltiples');
      (error as any).details = data.details ?? [];
      throw error;
    }
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al crear asistencias múltiples');
  }
};

export const updateAttendance = async (
  id: number,
  attendanceData: UpdateAttendanceRequest
): Promise<Attendance> => {
  try {
    const { data } = await apiClient.patch<ApiResponse<Attendance>>(`/api/attendance/${id}`, attendanceData);
    if (!data.success) throw new Error(data.message || 'Error al actualizar asistencia');
    return data.data;
  } catch (error) {
    handleApiError(error, 'Error al actualizar asistencia');
  }
};

export const deleteAttendance = async (id: number): Promise<void> => {
  try {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/api/attendance/${id}`);
    if (!data.success) throw new Error(data.message || 'Error al eliminar asistencia');
  } catch (error) {
    handleApiError(error, 'Error al eliminar asistencia');
  }
};

// ==================== UTILS ====================
function handleApiError(error: unknown, fallbackMessage: string): never {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || error.message || fallbackMessage;
    const details = error.response?.data?.details || [];
    const err = new Error(message);
    (err as any).details = details;
    throw err;
  }
  if (error instanceof Error) throw error;
  throw new Error(fallbackMessage);
}