"use client";

// hooks/useSchoolCycles.ts
import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getSchoolCycles,
  createCycle,
  updateCycle
} from '@/services/useSchoolCycles';
import {
  SchoolCycle,
  SchoolCyclePayload
} from '@/types/SchoolCycle';

// ==================== QUERY KEYS ====================
export const schoolCycleKeys = {
  all: ['school-cycles'] as const,
  lists: () => [...schoolCycleKeys.all, 'list'] as const,
  list: () => [...schoolCycleKeys.lists()] as const,
  details: () => [...schoolCycleKeys.all, 'detail'] as const,
  detail: (id: number | string) => [...schoolCycleKeys.details(), id] as const,
  active: () => [...schoolCycleKeys.all, 'active'] as const,
};

// ==================== HOOKS DE CONSULTA ====================

// Hook para obtener todos los ciclos escolares
export const useSchoolCycles = (enabled: boolean = true) => {
  return useQuery({
    queryKey: schoolCycleKeys.list(),
    queryFn: getSchoolCycles,
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutos (los ciclos no cambian frecuentemente)
  });
};

// Hook para obtener un ciclo específico (del cache)
export const useSchoolCycle = (cycleId: number | string) => {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: schoolCycleKeys.detail(cycleId),
    queryFn: () => {
      // Intentar obtener del cache primero
      const cycles = queryClient.getQueryData<SchoolCycle[]>(
        schoolCycleKeys.list()
      );
      const cycle = cycles?.find(c => c.id.toString() === cycleId.toString());
      
      if (cycle) {
        return Promise.resolve(cycle);
      }
      
      throw new Error('Ciclo escolar no encontrado en cache');
    },
    enabled: !!cycleId,
    staleTime: 10 * 60 * 1000,
  });
};

// Hook para obtener el ciclo activo
export const useActiveCycle = () => {
  const { data: cycles, ...rest } = useSchoolCycles();
  
  const activeCycle = React.useMemo(() => {
    if (!cycles) return null;
    return cycles.find(cycle => cycle.isActive) || null;
  }, [cycles]);

  return {
    activeCycle,
    activeCycleId: activeCycle?.id || null,
    ...rest
  };
};

// ==================== HOOKS DE MUTACIÓN ====================

// Hook para crear ciclo escolar
export const useCreateSchoolCycle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCycle,
    onSuccess: (newCycle) => {
      // Invalidar y refetch de listas
      queryClient.invalidateQueries({ queryKey: schoolCycleKeys.lists() });
      
      // Agregar al cache si existe
      const currentData = queryClient.getQueryData<SchoolCycle[]>(
        schoolCycleKeys.list()
      );
      if (currentData) {
        queryClient.setQueryData(
          schoolCycleKeys.list(),
          [...currentData, newCycle]
        );
      }
      
      // Si es el único ciclo activo, invalidar cache de activo
      if (newCycle.isActive) {
        queryClient.invalidateQueries({ queryKey: schoolCycleKeys.active() });
      }
      
      toast.success('Ciclo escolar creado exitosamente');
    },
    onError: (error: any) => {
      const message = error.message || 'Error al crear el ciclo escolar';
      toast.error(message);
    },
  });
};

// Hook para actualizar ciclo escolar
export const useUpdateSchoolCycle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: SchoolCyclePayload }) =>
      updateCycle(id, data),
    onSuccess: (updatedCycle, variables) => {
      // Actualizar cache específico
      queryClient.setQueryData(schoolCycleKeys.detail(variables.id), updatedCycle);
      
      // Actualizar en la lista
      const currentData = queryClient.getQueryData<SchoolCycle[]>(
        schoolCycleKeys.list()
      );
      
      if (currentData) {
        const updatedData = currentData.map(cycle =>
          cycle.id.toString() === variables.id.toString() ? updatedCycle : cycle
        );
        queryClient.setQueryData(schoolCycleKeys.list(), updatedData);
      }
      
      // Si cambió el estado activo, invalidar cache de activo
      if ('isActive' in variables.data) {
        queryClient.invalidateQueries({ queryKey: schoolCycleKeys.active() });
      }
      
      // Invalidar listas generales
      queryClient.invalidateQueries({ queryKey: schoolCycleKeys.lists() });
      
      toast.success('Ciclo escolar actualizado exitosamente');
    },
    onError: (error: any) => {
      const message = error.message || 'Error al actualizar el ciclo escolar';
      toast.error(message);
    },
  });
};

// ==================== HOOKS COMBINADOS ====================

// Hook combinado para manejo completo de ciclos escolares
export const useSchoolCycleManagement = () => {
  const queryClient = useQueryClient();

  const cycles = useSchoolCycles();
  const activeCycle = useActiveCycle();
  const createCycle = useCreateSchoolCycle();
  const updateCycle = useUpdateSchoolCycle();

  // Función helper para refrescar todos los datos
  const refetchAll = () => {
    queryClient.invalidateQueries({ queryKey: schoolCycleKeys.all });
  };

  // Función helper para limpiar cache
  const clearCache = () => {
    queryClient.removeQueries({ queryKey: schoolCycleKeys.all });
  };

  return {
    // Datos
    cycles: cycles.data || [],
    activeCycle: activeCycle.activeCycle,
    activeCycleId: activeCycle.activeCycleId,
    
    // Estados de carga
    isLoading: cycles.isLoading || activeCycle.isLoading,
    isError: cycles.isError || activeCycle.isError,
    error: cycles.error || activeCycle.error,
    
    // Mutaciones
    createCycle,
    updateCycle,
    
    // Helpers
    refetchAll,
    clearCache,
    
    // Estados de mutaciones
    isCreating: createCycle.isPending,
    isUpdating: updateCycle.isPending,
    
    // Información adicional
    hasActiveCycle: !!activeCycle.activeCycle,
  };
};

// ==================== HOOKS UTILITARIOS ====================

// Hook para obtener ciclos con información adicional
export const useSchoolCyclesWithStats = () => {
  const { data: cycles, ...rest } = useSchoolCycles();
  
  const stats = React.useMemo(() => {
    if (!cycles) return null;
    
    const now = new Date();
    const activeCycles = cycles.filter(cycle => cycle.isActive);
    const currentCycles = cycles.filter(cycle => {
      const start = new Date(cycle.startDate);
      const end = new Date(cycle.endDate);
      return start <= now && now <= end;
    });
    const futureCycles = cycles.filter(cycle => 
      new Date(cycle.startDate) > now
    );
    const pastCycles = cycles.filter(cycle => 
      new Date(cycle.endDate) < now
    );
    
    return {
      total: cycles.length,
      active: activeCycles.length,
      current: currentCycles.length,
      future: futureCycles.length,
      past: pastCycles.length,
      hasMultipleActive: activeCycles.length > 1, // Posible problema
    };
  }, [cycles]);
  
  return {
    cycles: cycles || [],
    stats,
    ...rest,
  };
};

// Hook para obtener ciclos por estado
export const useSchoolCyclesByStatus = () => {
  const { data: cycles } = useSchoolCycles();
  
  return React.useMemo(() => {
    if (!cycles) {
      return {
        active: [],
        current: [],
        future: [],
        past: [],
        all: []
      };
    }
    
    const now = new Date();
    
    const active = cycles.filter(cycle => cycle.isActive);
    
    const current = cycles.filter(cycle => {
      const start = new Date(cycle.startDate);
      const end = new Date(cycle.endDate);
      return start <= now && now <= end;
    });
    
    const future = cycles.filter(cycle => 
      new Date(cycle.startDate) > now
    );
    
    const past = cycles.filter(cycle => 
      new Date(cycle.endDate) < now
    );
    
    return {
      active,
      current,
      future,
      past,
      all: cycles
    };
  }, [cycles]);
};

// Hook para acciones específicas de ciclos
export const useSchoolCycleActions = () => {
  const createMutation = useCreateSchoolCycle();
  const updateMutation = useUpdateSchoolCycle();

  return {
    createCycle: createMutation.mutateAsync,
    updateCycle: updateMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isMutating: createMutation.isPending || updateMutation.isPending,
  };
};

// Hook para validaciones de ciclos
export const useSchoolCycleValidation = () => {
  const { cycles } = useSchoolCycleManagement();
  
  const validateNewCycle = React.useCallback((newCycleData: SchoolCyclePayload) => {
    const errors: string[] = [];
    
    // Validar fechas
    const startDate = new Date(newCycleData.startDate);
    const endDate = new Date(newCycleData.endDate);
    
    if (startDate >= endDate) {
      errors.push('La fecha de inicio debe ser anterior a la fecha de fin');
    }
    
    // Validar solapamiento con otros ciclos
    const hasOverlap = cycles.some(cycle => {
      const cycleStart = new Date(cycle.startDate);
      const cycleEnd = new Date(cycle.endDate);
      
      return (
        (startDate >= cycleStart && startDate <= cycleEnd) ||
        (endDate >= cycleStart && endDate <= cycleEnd) ||
        (startDate <= cycleStart && endDate >= cycleEnd)
      );
    });
    
    if (hasOverlap) {
      errors.push('Las fechas se superponen con otro ciclo escolar existente');
    }
    
    // Validar múltiples ciclos activos
    if (newCycleData.isActive && cycles.some(cycle => cycle.isActive)) {
      errors.push('Ya existe un ciclo escolar activo. Desactiva el actual antes de activar otro.');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }, [cycles]);
  
  return {
    validateNewCycle,
    cycles
  };
};

export default useSchoolCycleManagement;