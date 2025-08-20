// src/hooks/useAttendance.ts
import { useState, useEffect } from 'react';
import { 
  Attendance, 
  CreateAttendanceRequest, 
  UpdateAttendanceRequest,
  AttendanceFilters,
  AttendanceResponse,
  AttendanceStats,
  AttendanceFormData,
  UpdateAttendanceFormData
} from '@/types/attendance.types';
import { 
  getAttendances, 
  createAttendance, 
  updateAttendance, 
  getAttendanceById,
  deleteAttendance,
  createBulkAttendance,
  getAttendancesByStudent,
  getAttendancesByEnrollment,
  getAttendancesByBimester,
  getAttendanceStats
} from '@/services/attendanceService';
import { createAttendanceSchema, updateAttendanceSchema, defaultAttendanceValues } from "@/schemas/attendance.schemas";
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';

type AttendanceFormSchemaData = z.infer<typeof createAttendanceSchema>;
type UpdateAttendanceFormSchemaData = z.infer<typeof updateAttendanceSchema>;

export function useAttendance(
  isEditMode: boolean = false, 
  id?: number,
  initialFilters?: AttendanceFilters
) {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [attendanceResponse, setAttendanceResponse] = useState<AttendanceResponse | null>(null);
  const [isLoadingAttendances, setIsLoadingAttendances] = useState(true);
  const [attendancesError, setAttendancesError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentAttendance, setCurrentAttendance] = useState<Attendance | null>(null);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const form = useForm<AttendanceFormSchemaData>({
    resolver: zodResolver(createAttendanceSchema),
    defaultValues: defaultAttendanceValues,
  });

  const updateForm = useForm<UpdateAttendanceFormSchemaData>({
    resolver: zodResolver(updateAttendanceSchema),
    defaultValues: {},
  });

  // Load attendance data when in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const loadAttendanceData = async () => {
        try {
          const attendance = await getAttendanceById(id);
          setCurrentAttendance(attendance);
          
          const formData: AttendanceFormSchemaData = {
            enrollmentId: attendance.enrollmentId.toString(),
            bimesterId: attendance.bimesterId.toString(),
            date: new Date(attendance.date).toISOString().split('T')[0],
            status: attendance.status,
            notes: attendance.notes || '',
          };
          
          form.reset(formData);
          updateForm.reset(formData);
        } catch (error) {
          console.error('Error loading attendance data:', error);
          toast.error('Error al cargar los datos de asistencia');
        }
      };
      loadAttendanceData();
    }
  }, [isEditMode, id, form, updateForm]);

  const fetchAttendances = async (filters?: AttendanceFilters) => {
    setIsLoadingAttendances(true);
    setAttendancesError(null);
    try {
      const response = await getAttendances(filters || initialFilters);
      setAttendanceResponse(response);
      setAttendances(response.data);
    } catch (error) {
      setAttendancesError('Error al cargar las asistencias');
      console.error(error);
      toast.error('Error al cargar las asistencias');
    } finally {
      setIsLoadingAttendances(false);
    }
  };

  const fetchAttendancesByStudent = async (studentId: number, filters?: Omit<AttendanceFilters, 'studentId'>) => {
    setIsLoadingAttendances(true);
    setAttendancesError(null);
    try {
      const response = await getAttendancesByStudent(studentId, filters);
      setAttendanceResponse(response);
      setAttendances(response.data);
    } catch (error) {
      setAttendancesError('Error al cargar las asistencias del estudiante');
      console.error(error);
      toast.error('Error al cargar las asistencias del estudiante');
    } finally {
      setIsLoadingAttendances(false);
    }
  };

  const fetchAttendancesByEnrollment = async (enrollmentId: number, filters?: Omit<AttendanceFilters, 'enrollmentId'>) => {
    setIsLoadingAttendances(true);
    setAttendancesError(null);
    try {
      const response = await getAttendancesByEnrollment(enrollmentId, filters);
      setAttendanceResponse(response);
      setAttendances(response.data);
    } catch (error) {
      setAttendancesError('Error al cargar las asistencias de la matrícula');
      console.error(error);
      toast.error('Error al cargar las asistencias de la matrícula');
    } finally {
      setIsLoadingAttendances(false);
    }
  };

  const fetchAttendancesByBimester = async (bimesterId: number, filters?: Omit<AttendanceFilters, 'bimesterId'>) => {
    setIsLoadingAttendances(true);
    setAttendancesError(null);
    try {
      const response = await getAttendancesByBimester(bimesterId, filters);
      setAttendanceResponse(response);
      setAttendances(response.data);
    } catch (error) {
      setAttendancesError('Error al cargar las asistencias del bimestre');
      console.error(error);
      toast.error('Error al cargar las asistencias del bimestre');
    } finally {
      setIsLoadingAttendances(false);
    }
  };

  const fetchAttendanceStats = async (enrollmentId: number, bimesterId?: number) => {
    setIsLoadingStats(true);
    try {
      const statsData = await getAttendanceStats(enrollmentId, bimesterId);
      setStats(statsData);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar las estadísticas de asistencia');
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleCreateAttendance = async (data: AttendanceFormSchemaData) => {
    setIsSubmitting(true);
    try {
      const requestData: CreateAttendanceRequest = {
        enrollmentId: parseInt(data.enrollmentId),
        bimesterId: parseInt(data.bimesterId),
        date: new Date(data.date),
        status: data.status,
        notes: data.notes || undefined,
      };

      await createAttendance(requestData);
      toast.success("Asistencia registrada correctamente");
      await fetchAttendances();
      form.reset();
      return { success: true };
    } catch (error: any) {
      console.log("Error completo:", error);
      console.log("Datos de respuesta:", error.response?.data);
      
      if (error.response?.data) {
        return { 
          success: false,
          message: error.response.data.message || "Error de validación",
          details: error.response.data.details || []
        };
      }
      
      toast.error(error.message || "Error al registrar la asistencia");
      return { 
        success: false, 
        message: error.message || "Error desconocido",
        details: []
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateBulkAttendance = async (data: CreateAttendanceRequest[]) => {
    setIsSubmitting(true);
    try {
      await createBulkAttendance(data);
      toast.success(`${data.length} registros de asistencia creados correctamente`);
      await fetchAttendances();
      return { success: true };
    } catch (error: any) {
      console.log("Error completo:", error);
      
      if (error.response?.data) {
        return { 
          success: false,
          message: error.response.data.message || "Error de validación",
          details: error.response.data.details || []
        };
      }
      
      toast.error(error.message || "Error al crear las asistencias");
      return { 
        success: false, 
        message: error.message || "Error desconocido",
        details: []
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAttendance = async (id: number, data: UpdateAttendanceFormSchemaData) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      const requestData: UpdateAttendanceRequest = {
        ...(data.enrollmentId && { enrollmentId: parseInt(data.enrollmentId) }),
        ...(data.bimesterId && { bimesterId: parseInt(data.bimesterId) }),
        ...(data.date && { date: new Date(data.date) }),
        ...(data.status && { status: data.status }),
        ...(data.notes !== undefined && { notes: data.notes || undefined }),
      };

      await updateAttendance(id, requestData);
      toast.success("Asistencia actualizada correctamente");
      await fetchAttendances();
      return { success: true };
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data; 
      }
      toast.error("Error al actualizar la asistencia");
      console.error(error);
      return { success: false, message: "Error desconocido" };
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAttendance = async (id: number) => {
    try {
      await deleteAttendance(id);
      toast.success("Asistencia eliminada correctamente");
      await fetchAttendances();
      return { success: true };
    } catch (error: any) {
      toast.error("Error al eliminar la asistencia");
      console.error(error);
      return { success: false, message: error.message || "Error desconocido" };
    }
  };

  const handleSubmit = isEditMode ? handleUpdateAttendance : handleCreateAttendance;

  useEffect(() => {
    fetchAttendances(initialFilters);
  }, []);

  return {
    // Data
    attendances,
    attendanceResponse,
    currentAttendance,
    stats,
    
    // Loading states
    isLoadingAttendances,
    isLoadingStats,
    isSubmitting,
    
    // Error states
    attendancesError,
    
    // Forms
    form,
    updateForm,
    
    // Actions
    fetchAttendances,
    fetchAttendancesByStudent,
    fetchAttendancesByEnrollment,
    fetchAttendancesByBimester,
    fetchAttendanceStats,
    createAttendance: handleCreateAttendance,
    createBulkAttendance: handleCreateBulkAttendance,
    updateAttendance: handleUpdateAttendance,
    deleteAttendance: handleDeleteAttendance,
    
    // Utils
    resetForm: () => form.reset(defaultAttendanceValues),
    resetUpdateForm: () => updateForm.reset({})
  };
}

// Hook simplificado para solo obtener asistencias
export function useAttendanceList(filters?: AttendanceFilters) {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendances = async (newFilters?: AttendanceFilters) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAttendances(newFilters || filters);
      setAttendances(response.data);
      setMeta(response.meta);
    } catch (err: any) {
      setError(err.message || 'Error al cargar asistencias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendances(filters);
  }, []);

  return {
    attendances,
    meta,
    loading,
    error,
    refetch: fetchAttendances
  };
}

// Hook para estadísticas de asistencia
export function useAttendanceStats(enrollmentId?: number, bimesterId?: number) {
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async (newEnrollmentId?: number, newBimesterId?: number) => {
    const targetEnrollmentId = newEnrollmentId || enrollmentId;
    if (!targetEnrollmentId) return;

    setLoading(true);
    setError(null);
    try {
      const statsData = await getAttendanceStats(targetEnrollmentId, newBimesterId || bimesterId);
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enrollmentId) {
      fetchStats();
    }
  }, [enrollmentId, bimesterId]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
}