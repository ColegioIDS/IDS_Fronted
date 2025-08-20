// src/hooks/useTeacher.ts
import { useState, useEffect } from 'react';
import { User } from '@/types/user';
import { 
  getTeachers,
  getAvailableTeachers,
  getTeacherStats,
  getTeacherWorkload,
  assignTeacherToSection,
  removeTeacherFromSection,
  TeacherAvailabilityResponse
} from '@/services/teacherService';
import { toast } from 'react-toastify';

interface TeacherFilters {
  available?: boolean;
  excludeSectionId?: number;
  gradeId?: number;
  hasSection?: boolean;
  isHomeroomTeacher?: boolean; // Agregar esta propiedad
}

// Extender User para incluir propiedades que podría tener
interface Teacher extends User {
  guidedSections?: any[];
  assignedSchedules?: any[];
  currentAssignment?: {
    sectionId: number;
    sectionName: string;
    gradeName: string;
    gradeLevel: string;
  } | null;
}

export function useTeacher(
  initialFilters?: TeacherFilters
) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [availabilityData, setAvailabilityData] = useState<TeacherAvailabilityResponse | null>(null);
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [teacherWorkload, setTeacherWorkload] = useState<any | null>(null);
  const [stats, setStats] = useState<any | null>(null);
  
  // Loading states
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(true);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [isLoadingWorkload, setIsLoadingWorkload] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Error states
  const [teachersError, setTeachersError] = useState<string | null>(null);

  // Fetch all teachers
  const fetchTeachers = async () => {
    setIsLoadingTeachers(true);
    setTeachersError(null);
    try {
      const data = await getTeachers();
      // Convertir User[] a Teacher[] agregando propiedades que podrían venir del backend
      const teachersData: Teacher[] = data.map(user => ({
        ...user,
        guidedSections: (user as any).guidedSections || [],
        assignedSchedules: (user as any).assignedSchedules || []
      }));
      setTeachers(teachersData);
    } catch (error: any) {
      setTeachersError('Error al cargar los profesores');
      console.error(error);
      toast.error('Error al cargar los profesores');
    } finally {
      setIsLoadingTeachers(false);
    }
  };

  // Fetch teacher availability
  const fetchTeacherAvailability = async (excludeSectionId?: number) => {
    setIsLoadingAvailability(true);
    setTeachersError(null);
    try {
      const data = await getAvailableTeachers(excludeSectionId);
      setAvailabilityData(data);
    } catch (error: any) {
      setTeachersError('Error al cargar profesores disponibles');
      console.error(error);
      toast.error('Error al cargar profesores disponibles');
    } finally {
      setIsLoadingAvailability(false);
    }
  };

  // Fetch teacher workload
  const fetchTeacherWorkload = async (teacherId: number) => {
    setIsLoadingWorkload(true);
    try {
      const data = await getTeacherWorkload(teacherId);
      setTeacherWorkload(data);
    } catch (error: any) {
      console.error(error);
      toast.error('Error al cargar la carga de trabajo del profesor');
    } finally {
      setIsLoadingWorkload(false);
    }
  };

  // Fetch teacher stats
  const fetchTeacherStats = async () => {
    setIsLoadingStats(true);
    try {
      const data = await getTeacherStats();
      setStats(data);
    } catch (error: any) {
      console.error(error);
      toast.error('Error al cargar las estadísticas de profesores');
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Assign teacher to section
  const handleAssignTeacher = async (teacherId: number, sectionId: number) => {
    setIsSubmitting(true);
    try {
      await assignTeacherToSection(teacherId, sectionId);
      toast.success("Profesor asignado correctamente");
      
      // Refresh data
      await fetchTeachers();
      if (availabilityData) {
        await fetchTeacherAvailability();
      }
      
      return { success: true };
    } catch (error: any) {
      console.log("Error completo:", error);
      
      if (error.response?.data) {
        return { 
          success: false,
          message: error.response.data.message || "Error de asignación",
          details: error.response.data.details || []
        };
      }
      
      toast.error(error.message || "Error al asignar el profesor");
      return { 
        success: false, 
        message: error.message || "Error desconocido",
        details: []
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remove teacher from section
  const handleRemoveTeacher = async (sectionId: number) => {
    setIsSubmitting(true);
    try {
      await removeTeacherFromSection(sectionId);
      toast.success("Profesor removido correctamente");
      
      // Refresh data
      await fetchTeachers();
      if (availabilityData) {
        await fetchTeacherAvailability();
      }
      
      return { success: true };
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data; 
      }
      toast.error("Error al remover el profesor");
      console.error(error);
      return { success: false, message: "Error desconocido" };
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get teacher by ID
  const getTeacherById = (id: number): Teacher | undefined => {
    return teachers.find(teacher => teacher.id === id);
  };

  // Get available teachers only
  const getAvailableTeachersOnly = (): Teacher[] => {
    return availabilityData?.available || [];
  };

  // Get assigned teachers only
  const getAssignedTeachersOnly = (): Teacher[] => {
    return availabilityData?.assigned || [];
  };

  // Initialize data
  useEffect(() => {
    fetchTeachers();
  }, []);

  return {
    // Data
    teachers,
    availabilityData,
    currentTeacher,
    teacherWorkload,
    stats,
    
    // Loading states
    isLoadingTeachers,
    isLoadingAvailability,
    isLoadingWorkload,
    isLoadingStats,
    isSubmitting,
    
    // Error states
    teachersError,
    
    // Actions
    fetchTeachers,
    fetchTeacherAvailability,
    fetchTeacherWorkload,
    fetchTeacherStats,
    assignTeacher: handleAssignTeacher,
    removeTeacher: handleRemoveTeacher,
    
    // Utils
    getTeacherById,
    getAvailableTeachersOnly,
    getAssignedTeachersOnly,
    setCurrentTeacher,
    
    // Refresh functions
    refreshTeachers: fetchTeachers,
    refreshAvailability: () => fetchTeacherAvailability(initialFilters?.excludeSectionId)
  };
}

// Hook simplificado para solo obtener profesores
export function useTeacherList(filters?: TeacherFilters) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeachers = async (newFilters?: TeacherFilters) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching teachers...'); // Debug
      
      // Usar getAvailableTeachers que tiene la lógica de asignaciones
      const availabilityData = await getAvailableTeachers();
      console.log('Availability data:', availabilityData); // Debug
      
      // Combinar profesores disponibles y asignados
      const allTeachers = [
        ...(availabilityData.available || []),
        ...(availabilityData.assigned || [])
      ];
      
      // Convertir a Teacher[] y marcar cuáles están asignados
      const teachersData: Teacher[] = allTeachers.map(user => {
        const isAssigned = availabilityData.assigned?.some(assigned => assigned.id === user.id);
        const assignedTeacher = availabilityData.assigned?.find(assigned => assigned.id === user.id);
        
        return {
          ...user,
          guidedSections: isAssigned ? [{ id: 1, name: 'Assigned' }] : [], // Simulamos asignación
          assignedSchedules: [],
          currentAssignment: (assignedTeacher as any)?.currentAssignment || null // Preservar currentAssignment
        };
      });
      
      console.log('Converted teachers data:', teachersData); // Debug
      
      // Apply filters if provided
      let filteredData = teachersData;
      const appliedFilters = newFilters || filters;
      
      if (appliedFilters?.available !== undefined) {
        // Filtrar por disponibilidad usando la información real del backend
        filteredData = appliedFilters.available 
          ? teachersData.filter(teacher => !teacher.guidedSections?.length)
          : teachersData.filter(teacher => teacher.guidedSections?.length);
      }
      
      if (appliedFilters?.isHomeroomTeacher !== undefined) {
        filteredData = filteredData.filter(teacher => {
          const isHomeroom = teacher.teacherDetails?.isHomeroomTeacher || false;
          return isHomeroom === appliedFilters.isHomeroomTeacher;
        });
      }
      
      console.log('Final filtered teachers:', filteredData); // Debug
      setTeachers(filteredData);
    } catch (err: any) {
      console.error('Error in fetchTeachers:', err); // Debug
      setError(err.message || 'Error al cargar profesores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useTeacherList useEffect triggered with filters:', filters); // Debug
    fetchTeachers(filters);
  }, []); // Remover dependencia de filters por ahora para evitar loops

  return {
    teachers,
    loading,
    error,
    refetch: fetchTeachers
  };
}

// Hook para disponibilidad de profesores
export function useTeacherAvailability(excludeSectionId?: number) {
  const [availabilityData, setAvailabilityData] = useState<TeacherAvailabilityResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailability = async (newExcludeSectionId?: number) => {
    const targetExcludeSectionId = newExcludeSectionId ?? excludeSectionId;
    
    setLoading(true);
    setError(null);
    try {
      const data = await getAvailableTeachers(targetExcludeSectionId);
      setAvailabilityData(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar disponibilidad de profesores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [excludeSectionId]);

  return {
    availabilityData,
    loading,
    error,
    refetch: fetchAvailability
  };
}

// Hook para estadísticas de profesores
export function useTeacherStats() {
  const [stats, setStats] = useState<any | null>(null); // Cambiar TeacherStats por any
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTeacherStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar estadísticas de profesores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
}

// Hook para carga de trabajo de un profesor específico
export function useTeacherWorkload(teacherId?: number) {
  const [workload, setWorkload] = useState<any | null>(null); // Cambiar TeacherWorkload por any
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkload = async (newTeacherId?: number) => {
    const targetTeacherId = newTeacherId || teacherId;
    if (!targetTeacherId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getTeacherWorkload(targetTeacherId);
      setWorkload(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar carga de trabajo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teacherId) {
      fetchWorkload();
    }
  }, [teacherId]);

  return {
    workload,
    loading,
    error,
    refetch: fetchWorkload
  };
}