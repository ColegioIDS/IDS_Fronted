// src/hooks/useGrade.ts
import { useState, useEffect } from 'react';
import { 
  Grade, 
  GradeFormValues,
  CreateGradeRequest,
  UpdateGradeRequest,
  GradeFilters,
  GradeResponse,
  GradeStats,
  GradeLevel
} from '@/types/grades';
import { 
  getGrades, 
  createGrade, 
  updateGrade, 
  getGradeById,
  deleteGrade,
  getGradesByLevel,
  getActiveGrades,
  getGradeStats
} from '@/services/gradeService';
import { gradeSchema, updateGradeSchema, defaultValues } from "@/schemas/grade";
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';

type GradeFormSchemaData = z.infer<typeof gradeSchema>;
type UpdateGradeFormSchemaData = z.infer<typeof updateGradeSchema>;

export function useGrade(
  isEditMode: boolean = false, 
  id?: number,
  initialFilters?: GradeFilters
) {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [gradeResponse, setGradeResponse] = useState<GradeResponse | null>(null);
  const [isLoadingGrades, setIsLoadingGrades] = useState(true);
  const [gradesError, setGradesError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentGrade, setCurrentGrade] = useState<Grade | null>(null);
  const [stats, setStats] = useState<GradeStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const form = useForm<GradeFormSchemaData>({
    resolver: zodResolver(gradeSchema),
    defaultValues,
  });

  const updateForm = useForm<UpdateGradeFormSchemaData>({
    resolver: zodResolver(updateGradeSchema),
    defaultValues: {},
  });

  // Load grade data when in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const loadGradeData = async () => {
        try {
          const grade = await getGradeById(id);
          setCurrentGrade(grade);
          
          const formData: GradeFormSchemaData = {
            name: grade.name,
            level: grade.level,
            order: grade.order,
            isActive: grade.isActive,
          };
          
          form.reset(formData);
          updateForm.reset(formData);
        } catch (error) {
          console.error('Error loading grade data:', error);
          toast.error('Error al cargar los datos del grado');
        }
      };
      loadGradeData();
    }
  }, [isEditMode, id, form, updateForm]);

  const fetchGrades = async (filters?: GradeFilters) => {
    setIsLoadingGrades(true);
    setGradesError(null);
    try {
      const response = await getGrades(filters || initialFilters);
      if (Array.isArray(response)) {
        // Si la respuesta es un array simple (tu caso actual)
        setGrades(response);
        setGradeResponse({
          data: response,
          meta: {
            total: response.length,
            page: 1,
            limit: response.length,
            totalPages: 1
          }
        });
      } else {
        // Si la respuesta tiene estructura con meta (futuro)
        setGradeResponse(response);
        setGrades(response.data);
      }
    } catch (error) {
      setGradesError('Error al cargar los grados');
      console.error(error);
      toast.error('Error al cargar los grados');
    } finally {
      setIsLoadingGrades(false);
    }
  };

  const fetchGradesByLevel = async (level: GradeLevel, filters?: Omit<GradeFilters, 'level'>) => {
    setIsLoadingGrades(true);
    setGradesError(null);
    try {
      const response = await getGradesByLevel(level, filters);
      setGradeResponse(response);
      setGrades(response.data);
    } catch (error) {
      setGradesError('Error al cargar los grados del nivel');
      console.error(error);
      toast.error('Error al cargar los grados del nivel');
    } finally {
      setIsLoadingGrades(false);
    }
  };

  const fetchActiveGrades = async (filters?: GradeFilters) => {
    setIsLoadingGrades(true);
    setGradesError(null);
    try {
      const response = await getActiveGrades(filters);
      setGradeResponse(response);
      setGrades(response.data);
    } catch (error) {
      setGradesError('Error al cargar los grados activos');
      console.error(error);
      toast.error('Error al cargar los grados activos');
    } finally {
      setIsLoadingGrades(false);
    }
  };

  const fetchGradeStats = async () => {
    setIsLoadingStats(true);
    try {
      const statsData = await getGradeStats();
      setStats(statsData);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar las estadísticas de grados');
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleCreateGrade = async (data: GradeFormSchemaData) => {
    setIsSubmitting(true);
    try {
      const requestData: CreateGradeRequest = {
        name: data.name,
        level: data.level,
        order: data.order,
        isActive: data.isActive,
      };

      await createGrade(requestData);
      toast.success("Grado creado correctamente");
      await fetchGrades();
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
      
      toast.error(error.message || "Error al crear el grado");
      return { 
        success: false, 
        message: error.message || "Error desconocido",
        details: []
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateGrade = async (id: number, data: UpdateGradeFormSchemaData) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      const requestData: UpdateGradeRequest = {
        ...(data.name && { name: data.name }),
        ...(data.level && { level: data.level }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      };

      await updateGrade(id, requestData);
      toast.success("Grado actualizado correctamente");
      await fetchGrades();
      return { success: true };
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data; 
      }
      toast.error("Error al actualizar el grado");
      console.error(error);
      return { success: false, message: "Error desconocido" };
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGrade = async (id: number) => {
    try {
      await deleteGrade(id);
      toast.success("Grado eliminado correctamente");
      await fetchGrades();
      return { success: true };
    } catch (error: any) {
      toast.error("Error al eliminar el grado");
      console.error(error);
      return { success: false, message: error.message || "Error desconocido" };
    }
  };

  const handleSubmit = isEditMode ? handleUpdateGrade : handleCreateGrade;

  useEffect(() => {
    fetchGrades(initialFilters);
  }, []);

  return {
    // Data
    grades,
    gradeResponse,
    currentGrade,
    stats,
    
    // Loading states
    isLoadingGrades,
    isLoadingStats,
    isSubmitting,
    
    // Error states
    gradesError,
    
    // Forms
    form,
    updateForm,
    
    // Actions
    fetchGrades,
    fetchGradesByLevel,
    fetchActiveGrades,
    fetchGradeStats,
    createGrade: handleCreateGrade,
    updateGrade: handleUpdateGrade,
    deleteGrade: handleDeleteGrade,
    
    // Utils
    resetForm: () => form.reset(defaultValues),
    resetUpdateForm: () => updateForm.reset({})
  };
}

// Hook simplificado para solo obtener grados
export function useGradeList(filters?: GradeFilters) {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGradeList = async (newFilters?: GradeFilters) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getGrades(newFilters || filters);
      if (Array.isArray(response)) {
        setGrades(response);
        setMeta({
          total: response.length,
          page: 1,
          limit: response.length,
          totalPages: 1
        });
      } else {
        setGrades(response.data);
        setMeta(response.meta);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar grados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGradeList(filters);
  }, []);

  return {
    grades,
    meta,
    loading,
    error,
    refetch: fetchGradeList
  };
}

// Hook para estadísticas de grados
export function useGradeStats() {
  const [stats, setStats] = useState<GradeStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const statsData = await getGradeStats();
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar estadísticas');
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