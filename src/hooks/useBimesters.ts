"use client";

// hooks/useBimesters.ts
import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getBimestersByCycle,
  createBimester,
  updateBimester
} from '@/services/useSchoolBimester';
import {
  Bimester,
  SchoolBimesterPayload
} from '@/types/SchoolBimesters';

// ==================== QUERY KEYS ====================
export const bimesterKeys = {
  all: ['bimesters'] as const,
  lists: () => [...bimesterKeys.all, 'list'] as const,
  list: (cycleId?: number) => [...bimesterKeys.lists(), cycleId] as const,
  details: () => [...bimesterKeys.all, 'detail'] as const,
  detail: (id: number) => [...bimesterKeys.details(), id] as const,
  cycle: (cycleId: number) => [...bimesterKeys.all, 'cycle', cycleId] as const,
};

// ==================== HOOKS DE CONSULTA ====================

// Hook para obtener bimestres por ciclo escolar
export const useBimestersByCycle = (cycleId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: bimesterKeys.cycle(cycleId),
    queryFn: () => getBimestersByCycle(cycleId),
    enabled: enabled && cycleId > 0,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para obtener un bimester específico (del cache)
export const useBimester = (bimesterId: number, cycleId?: number) => {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: bimesterKeys.detail(bimesterId),
    queryFn: () => {
      // Intentar obtener del cache primero
      const bimesters = queryClient.getQueryData<Bimester[]>(
        bimesterKeys.cycle(cycleId || 1)
      );
      const bimester = bimesters?.find(b => b.id === bimesterId);
      
      if (bimester) {
        return Promise.resolve(bimester);
      }
      
      throw new Error('Bimestre no encontrado en cache');
    },
    enabled: bimesterId > 0,
    staleTime: 5 * 60 * 1000,
  });
};

// ==================== HOOKS DE MUTACIÓN ====================

// Hook para crear bimestre
export const useCreateBimester = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cycleId, data }: { cycleId: number; data: SchoolBimesterPayload }) =>
      createBimester(cycleId, data),
    onSuccess: (newBimester, variables) => {
      // Invalidar y refetch de listas del ciclo específico
      queryClient.invalidateQueries({ queryKey: bimesterKeys.cycle(variables.cycleId) });
      queryClient.invalidateQueries({ queryKey: bimesterKeys.lists() });
      
      // Agregar al cache del ciclo específico si existe
      const cycleData = queryClient.getQueryData<Bimester[]>(
        bimesterKeys.cycle(variables.cycleId)
      );
      if (cycleData) {
        queryClient.setQueryData(
          bimesterKeys.cycle(variables.cycleId),
          [...cycleData, newBimester]
        );
      }
      
      toast.success('Bimestre creado exitosamente');
    },
    onError: (error: any) => {
      const message = error.message || 'Error al crear el bimestre';
      toast.error(message);
    },
  });
};

// Hook para actualizar bimestre
export const useUpdateBimester = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<SchoolBimesterPayload> }) =>
      updateBimester(id, data),
    onSuccess: (updatedBimester, variables) => {
      // Actualizar cache específico
      queryClient.setQueryData(bimesterKeys.detail(variables.id), updatedBimester);
      
      // Actualizar en la lista del ciclo
      const cycleId = updatedBimester.cycleId;
      if (cycleId) {
        const cycleData = queryClient.getQueryData<Bimester[]>(
          bimesterKeys.cycle(cycleId)
        );
        
        if (cycleData) {
          const updatedCycleData = cycleData.map(bimester =>
            bimester.id === variables.id ? updatedBimester : bimester
          );
          queryClient.setQueryData(bimesterKeys.cycle(cycleId), updatedCycleData);
        }
      }
      
      // Invalidar listas generales
      queryClient.invalidateQueries({ queryKey: bimesterKeys.lists() });
      
      toast.success('Bimestre actualizado exitosamente');
    },
    onError: (error: any) => {
      const message = error.message || 'Error al actualizar el bimestre';
      toast.error(message);
    },
  });
};

// ==================== HOOKS COMBINADOS ====================

// Hook combinado para manejo completo de bimestres de un ciclo
export const useBimesterManagement = (cycleId: number) => {
  const queryClient = useQueryClient();

  const bimesters = useBimestersByCycle(cycleId);
  const createBimester = useCreateBimester();
  const updateBimester = useUpdateBimester();

  // Función helper para refrescar datos del ciclo
  const refetchCycle = () => {
    queryClient.invalidateQueries({ queryKey: bimesterKeys.cycle(cycleId) });
  };

  // Función helper para limpiar cache del ciclo
  const clearCycleCache = () => {
    queryClient.removeQueries({ queryKey: bimesterKeys.cycle(cycleId) });
  };

  // Función helper para refrescar todos los datos
  const refetchAll = () => {
    queryClient.invalidateQueries({ queryKey: bimesterKeys.all });
  };

  return {
    // Datos
    bimesters: bimesters.data || [],
    
    // Estados de carga
    isLoading: bimesters.isLoading,
    isError: bimesters.isError,
    error: bimesters.error,
    
    // Mutaciones
    createBimester,
    updateBimester,
    
    // Helpers
    refetchCycle,
    clearCycleCache,
    refetchAll,
    
    // Estados de mutaciones
    isCreating: createBimester.isPending,
    isUpdating: updateBimester.isPending,
    
    // Información del ciclo
    cycleId,
  };
};

// ==================== HOOKS UTILITARIOS ====================

// Hook para obtener bimestres con información adicional
export const useBimestersWithStats = (cycleId: number) => {
  const { data: bimesters, ...rest } = useBimestersByCycle(cycleId);
  
  const stats = React.useMemo(() => {
    if (!bimesters) return null;
    
    const now = new Date();
    const activeBimester = bimesters.find(bimester => {
      const start = new Date(bimester.startDate);
      const end = new Date(bimester.endDate);
      return start <= now && now <= end;
    });
    
    const completedBimesters = bimesters.filter(bimester => 
      new Date(bimester.endDate) < now
    );
    const upcomingBimesters = bimesters.filter(bimester => 
      new Date(bimester.startDate) > now
    );
    
    return {
      total: bimesters.length,
      completed: completedBimesters.length,
      upcoming: upcomingBimesters.length,
      active: activeBimester || null,
      progress: bimesters.length > 0 ? (completedBimesters.length / bimesters.length) * 100 : 0,
    };
  }, [bimesters]);
  
  return {
    bimesters: bimesters || [],
    stats,
    ...rest,
  };
};

// Hook para obtener bimester activo
export const useActiveBimester = (cycleId: number) => {
  const { data: bimesters } = useBimestersByCycle(cycleId);
  
  return React.useMemo(() => {
    if (!bimesters) return null;
    
    const now = new Date();
    return bimesters.find(bimester => {
      const start = new Date(bimester.startDate);
      const end = new Date(bimester.endDate);
      return start <= now && now <= end;
    }) || null;
  }, [bimesters]);
};

// Hook para obtener bimestres por estado
export const useBimestersByStatus = (cycleId: number) => {
  const { data: bimesters } = useBimestersByCycle(cycleId);
  
  return React.useMemo(() => {
    if (!bimesters) {
      return {
        active: [],
        completed: [],
        upcoming: [],
        all: []
      };
    }
    
    const now = new Date();
    
    const active = bimesters.filter(bimester => {
      const start = new Date(bimester.startDate);
      const end = new Date(bimester.endDate);
      return start <= now && now <= end;
    });
    
    const completed = bimesters.filter(bimester => 
      new Date(bimester.endDate) < now
    );
    
    const upcoming = bimesters.filter(bimester => 
      new Date(bimester.startDate) > now
    );
    
    return {
      active,
      completed,
      upcoming,
      all: bimesters
    };
  }, [bimesters]);
};

// Hook para acciones específicas de bimestres
export const useBimesterActions = () => {
  const createMutation = useCreateBimester();
  const updateMutation = useUpdateBimester();

  return {
    createBimester: createMutation.mutateAsync,
    updateBimester: updateMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isMutating: createMutation.isPending || updateMutation.isPending,
  };
};

export default useBimesterManagement;