// hooks/useAcademicWeeks.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { toast } from 'sonner';
import {
  getAcademicWeeks,
  getAcademicWeekById,
  getAcademicWeeksByBimester,
  getAcademicWeekByNumber,
  getCurrentWeek,
  createAcademicWeek,
  updateAcademicWeek,
  deleteAcademicWeek,
  generateWeeksForBimester
} from '@/services/academic-weeks';
import {
  AcademicWeek,
  AcademicWeekFormValues,
  UpdateAcademicWeekFormValues,
  AcademicWeekFilters,
  GenerateWeeksRequest,
  CurrentWeekResponse
} from '@/types/academic-week.types';

// ==================== QUERY KEYS ====================
export const academicWeekKeys = {
  all: ['academic-weeks'] as const,
  lists: () => [...academicWeekKeys.all, 'list'] as const,
  list: (filters?: AcademicWeekFilters) => [...academicWeekKeys.lists(), filters] as const,
  details: () => [...academicWeekKeys.all, 'detail'] as const,
  detail: (id: number) => [...academicWeekKeys.details(), id] as const,
  bimester: (bimesterId: number) => [...academicWeekKeys.all, 'bimester', bimesterId] as const,
  weekNumber: (bimesterId: number, number: number) => 
    [...academicWeekKeys.all, 'week-number', bimesterId, number] as const,
  current: () => [...academicWeekKeys.all, 'current'] as const,
};

// ==================== HOOKS DE CONSULTA ====================

// Hook para obtener todas las semanas académicas
export const useAcademicWeeks = (filters?: AcademicWeekFilters) => {
  return useQuery({
    queryKey: academicWeekKeys.list(filters),
    queryFn: () => getAcademicWeeks(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para obtener una semana académica por ID
export const useAcademicWeek = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: academicWeekKeys.detail(id),
    queryFn: () => getAcademicWeekById(id),
    enabled: enabled && id > 0,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para obtener semanas por bimestre
export const useAcademicWeeksByBimester = (bimesterId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: academicWeekKeys.bimester(bimesterId),
    queryFn: () => getAcademicWeeksByBimester(bimesterId),
    enabled: enabled && bimesterId > 0,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para obtener semana específica por número
export const useAcademicWeekByNumber = (
  bimesterId: number, 
  number: number, 
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: academicWeekKeys.weekNumber(bimesterId, number),
    queryFn: () => getAcademicWeekByNumber(bimesterId, number),
    enabled: enabled && bimesterId > 0 && number > 0,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para obtener la semana actual
export const useCurrentWeek = () => {
  return useQuery({
    queryKey: academicWeekKeys.current(),
    queryFn: getCurrentWeek,
    staleTime: 10 * 60 * 1000, // 10 minutos
    refetchInterval: 30 * 60 * 1000, // Refetch cada 30 minutos
  });
};

// ==================== HOOKS DE MUTACIÓN ====================

// Hook para crear semana académica
export const useCreateAcademicWeek = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAcademicWeek,
    onSuccess: (newWeek) => {
      // Invalidar y refetch de listas
      queryClient.invalidateQueries({ queryKey: academicWeekKeys.lists() });
      queryClient.invalidateQueries({ queryKey: academicWeekKeys.bimester(newWeek.bimesterId) });
      queryClient.invalidateQueries({ queryKey: academicWeekKeys.current() });
      
      toast.success('Semana académica creada exitosamente');
    },
    onError: (error: any) => {
      const message = error.message || 'Error al crear la semana académica';
      toast.error(message);
    },
  });
};

// Hook para actualizar semana académica
export const useUpdateAcademicWeek = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAcademicWeekFormValues }) =>
      updateAcademicWeek(id, data),
    onSuccess: (updatedWeek, variables) => {
      // Actualizar cache específico
      queryClient.setQueryData(academicWeekKeys.detail(variables.id), updatedWeek);
      
      // Invalidar listas relacionadas
      queryClient.invalidateQueries({ queryKey: academicWeekKeys.lists() });
      queryClient.invalidateQueries({ queryKey: academicWeekKeys.bimester(updatedWeek.bimesterId) });
      queryClient.invalidateQueries({ queryKey: academicWeekKeys.current() });
      
      toast.success('Semana académica actualizada exitosamente');
    },
    onError: (error: any) => {
      const message = error.message || 'Error al actualizar la semana académica';
      toast.error(message);
    },
  });
};

// Hook para eliminar semana académica
export const useDeleteAcademicWeek = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAcademicWeek,
    onSuccess: (_, deletedId) => {
      // Remover de cache específico
      queryClient.removeQueries({ queryKey: academicWeekKeys.detail(deletedId) });
      
      // Invalidar todas las listas
      queryClient.invalidateQueries({ queryKey: academicWeekKeys.lists() });
      queryClient.invalidateQueries({ queryKey: academicWeekKeys.all });
      
      toast.success('Semana académica eliminada exitosamente');
    },
    onError: (error: any) => {
      const message = error.message || 'Error al eliminar la semana académica';
      toast.error(message);
    },
  });
};

// Hook para generar semanas automáticamente
export const useGenerateWeeks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bimesterId, options }: { bimesterId: number; options?: GenerateWeeksRequest }) =>
      generateWeeksForBimester(bimesterId, options),
    onSuccess: (generatedWeeks, variables) => {
      // Invalidar todas las consultas relacionadas
      queryClient.invalidateQueries({ queryKey: academicWeekKeys.lists() });
      queryClient.invalidateQueries({ queryKey: academicWeekKeys.bimester(variables.bimesterId) });
      queryClient.invalidateQueries({ queryKey: academicWeekKeys.current() });
      
      toast.success(`${generatedWeeks.length} semanas académicas generadas exitosamente`);
    },
    onError: (error: any) => {
      const message = error.message || 'Error al generar las semanas académicas';
      toast.error(message);
    },
  });
};

// ==================== HOOKS COMBINADOS ====================

// Hook combinado para manejo completo de semanas académicas
export const useAcademicWeekManagement = (bimesterId?: number) => {
  const queryClient = useQueryClient();

  const weeks = useAcademicWeeks();
  const weeksByBimester = useAcademicWeeksByBimester(bimesterId || 0, !!bimesterId);
  const currentWeek = useCurrentWeek();
  
  const createWeek = useCreateAcademicWeek();
  const updateWeek = useUpdateAcademicWeek();
  const deleteWeek = useDeleteAcademicWeek();
  const generateWeeks = useGenerateWeeks();

  // Función helper para refrescar datos
  const refetchAll = () => {
    queryClient.invalidateQueries({ queryKey: academicWeekKeys.all });
  };

  // Función helper para limpiar cache
  const clearCache = () => {
    queryClient.removeQueries({ queryKey: academicWeekKeys.all });
  };

  return {
    // Datos
    weeks: weeks.data || [],
    weeksByBimester: weeksByBimester.data || [],
    currentWeek: currentWeek.data,
    
    // Estados de carga
    isLoading: weeks.isLoading || weeksByBimester.isLoading || currentWeek.isLoading,
    isError: weeks.isError || weeksByBimester.isError || currentWeek.isError,
    
    // Mutaciones
    createWeek,
    updateWeek,
    deleteWeek,
    generateWeeks,
    
    // Helpers
    refetchAll,
    clearCache,
    
    // Estados de mutaciones
    isCreating: createWeek.isPending,
    isUpdating: updateWeek.isPending,
    isDeleting: deleteWeek.isPending,
    isGenerating: generateWeeks.isPending,
    
    // Errores
    error: weeks.error || weeksByBimester.error || currentWeek.error,
  };
};

// ==================== HOOKS UTILITARIOS ====================

// Hook para obtener semanas de un bimestre con información adicional
export const useAcademicWeeksWithStats = (bimesterId: number) => {
  const { data: weeks, ...rest } = useAcademicWeeksByBimester(bimesterId);
  
  const stats = React.useMemo(() => {
    if (!weeks) return null;
    
    const now = new Date();
    const currentWeek = weeks.find(week => {
      const start = new Date(week.startDate);
      const end = new Date(week.endDate);
      return start <= now && now <= end;
    });
    
    const completedWeeks = weeks.filter(week => new Date(week.endDate) < now);
    const upcomingWeeks = weeks.filter(week => new Date(week.startDate) > now);
    
    return {
      total: weeks.length,
      completed: completedWeeks.length,
      upcoming: upcomingWeeks.length,
      current: currentWeek || null,
      progress: weeks.length > 0 ? (completedWeeks.length / weeks.length) * 100 : 0,
    };
  }, [weeks]);
  
  return {
    weeks: weeks || [],
    stats,
    ...rest,
  };
};

export default useAcademicWeekManagement;