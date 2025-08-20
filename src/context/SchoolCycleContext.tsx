"use client";

// contexts/SchoolCycleContext.tsx
import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useSchoolCycles,
  useActiveCycle,
  useCreateSchoolCycle,
  useUpdateSchoolCycle,
  useSchoolCycleValidation,
  schoolCycleKeys
} from '@/hooks/useSchoolCycles';
import {
  SchoolCycle,
  SchoolCyclePayload
} from '@/types/SchoolCycle';

// ==================== TIPOS DEL CONTEXT ====================
interface SchoolCycleContextValue {
  // Datos principales
  cycles: SchoolCycle[];
  activeCycle: SchoolCycle | null;
  activeCycleId: number | string | null;
  
  // Estados de carga
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  
  // Funciones de mutación
  createCycle: (data: SchoolCyclePayload) => Promise<SchoolCycle>;
  updateCycle: (id: string | number, data: SchoolCyclePayload) => Promise<SchoolCycle>;
  
  // Estados de mutación
  isCreating: boolean;
  isUpdating: boolean;
  
  // Utilidades
  getCycleById: (id: number | string) => SchoolCycle | undefined;
  getCycleByName: (name: string) => SchoolCycle | undefined;
  getCyclesByStatus: () => {
    active: SchoolCycle[];
    current: SchoolCycle[];
    future: SchoolCycle[];
    past: SchoolCycle[];
  };
  getActiveCycleInfo: () => {
    cycle: SchoolCycle | null;
    isActive: boolean;
    daysRemaining: number;
    progress: number;
    academicYear: string;
  };
  validateNewCycle: (data: SchoolCyclePayload) => {
    isValid: boolean;
    errors: string[];
  };
  refetchAll: () => void;
  clearCache: () => void;
  
  // Estadísticas globales
  stats: {
    totalCycles: number;
    activeCycles: number;
    currentCycles: number;
    futureCycles: number;
    pastCycles: number;
    hasMultipleActive: boolean;
  };
}

interface SchoolCycleProviderProps {
  children: React.ReactNode;
}

// ==================== CONTEXT ====================
const SchoolCycleContext = createContext<SchoolCycleContextValue | undefined>(undefined);

// ==================== PROVIDER ====================
export const SchoolCycleProvider: React.FC<SchoolCycleProviderProps> = ({
  children
}) => {
  const queryClient = useQueryClient();

  // ========== QUERIES ==========
  const {
    data: cycles = [],
    isLoading,
    isError,
    error
  } = useSchoolCycles();

  const {
    activeCycle,
    activeCycleId,
    isLoading: isLoadingActive,
    isError: isErrorActive
  } = useActiveCycle();

  // ========== MUTATIONS ==========
  const createCycleMutation = useCreateSchoolCycle();
  const updateCycleMutation = useUpdateSchoolCycle();

  // ========== VALIDATION ==========
  const { validateNewCycle: validateCycle } = useSchoolCycleValidation();

  // ========== COMPUTED STATES ==========
  const isCreating = createCycleMutation.isPending;
  const isUpdating = updateCycleMutation.isPending;

  // ========== ESTADÍSTICAS ==========
  const stats = useMemo(() => {
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
      totalCycles: cycles.length,
      activeCycles: activeCycles.length,
      currentCycles: currentCycles.length,
      futureCycles: futureCycles.length,
      pastCycles: pastCycles.length,
      hasMultipleActive: activeCycles.length > 1,
    };
  }, [cycles]);

  // ========== FUNCIONES DE MUTACIÓN ==========
  const createCycle = useCallback(async (data: SchoolCyclePayload): Promise<SchoolCycle> => {
    return await createCycleMutation.mutateAsync(data);
  }, [createCycleMutation]);

  const updateCycle = useCallback(async (
    id: string | number, 
    data: SchoolCyclePayload
  ): Promise<SchoolCycle> => {
    return await updateCycleMutation.mutateAsync({ id, data });
  }, [updateCycleMutation]);

  // ========== FUNCIONES UTILITARIAS ==========
  const getCycleById = useCallback((id: number | string): SchoolCycle | undefined => {
    return cycles.find(cycle => cycle.id.toString() === id.toString());
  }, [cycles]);

  const getCycleByName = useCallback((name: string): SchoolCycle | undefined => {
    return cycles.find(cycle => 
      cycle.name.toLowerCase().includes(name.toLowerCase())
    );
  }, [cycles]);

  const getCyclesByStatus = useCallback(() => {
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

    return { active, current, future, past };
  }, [cycles]);

  const getActiveCycleInfo = useCallback(() => {
    const now = new Date();
    let activeCycleData: SchoolCycle | null = activeCycle;

    const isActive = !!activeCycleData;
    
    let daysRemaining = 0;
    let progress = 0;
    let academicYear = '';

    if (activeCycleData) {
      const endDate = new Date(activeCycleData.endDate);
      const startDate = new Date(activeCycleData.startDate);
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const elapsedDays = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      progress = totalDays > 0 ? Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100)) : 0;
      academicYear = activeCycleData.name;
    }

    return {
      cycle: activeCycleData,
      isActive,
      daysRemaining,
      progress,
      academicYear,
    };
  }, [activeCycle]);

  const validateNewCycle = useCallback((data: SchoolCyclePayload) => {
    return validateCycle(data);
  }, [validateCycle]);

  const refetchAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: schoolCycleKeys.all });
  }, [queryClient]);

  const clearCache = useCallback(() => {
    queryClient.removeQueries({ queryKey: schoolCycleKeys.all });
  }, [queryClient]);

  // ========== CONTEXT VALUE ==========
  const contextValue: SchoolCycleContextValue = useMemo(() => ({
    // Datos principales
    cycles,
    activeCycle,
    activeCycleId,
    
    // Estados de carga
    isLoading: isLoading || isLoadingActive,
    isError: isError || isErrorActive,
    error,
    
    // Funciones de mutación
    createCycle,
    updateCycle,
    
    // Estados de mutación
    isCreating,
    isUpdating,
    
    // Utilidades
    getCycleById,
    getCycleByName,
    getCyclesByStatus,
    getActiveCycleInfo,
    validateNewCycle,
    refetchAll,
    clearCache,
    
    // Estadísticas
    stats,
  }), [
    cycles,
    activeCycle,
    activeCycleId,
    isLoading,
    isLoadingActive,
    isError,
    isErrorActive,
    error,
    createCycle,
    updateCycle,
    isCreating,
    isUpdating,
    getCycleById,
    getCycleByName,
    getCyclesByStatus,
    getActiveCycleInfo,
    validateNewCycle,
    refetchAll,
    clearCache,
    stats,
  ]);

  return (
    <SchoolCycleContext.Provider value={contextValue}>
      {children}
    </SchoolCycleContext.Provider>
  );
};

// ==================== HOOK PERSONALIZADO ====================
export const useSchoolCycleContext = (): SchoolCycleContextValue => {
  const context = useContext(SchoolCycleContext);
  
  if (context === undefined) {
    throw new Error('useSchoolCycleContext debe ser usado dentro de SchoolCycleProvider');
  }
  
  return context;
};

// ==================== HOOKS ESPECIALIZADOS ====================

// Hook para obtener solo el ciclo activo
export const useCurrentSchoolCycle = () => {
  const { getActiveCycleInfo } = useSchoolCycleContext();
  return getActiveCycleInfo();
};

// Hook para obtener ciclos por estado
export const useSchoolCyclesByState = () => {
  const { getCyclesByStatus, isLoading } = useSchoolCycleContext();
  
  return useMemo(() => ({
    ...getCyclesByStatus(),
    isLoading,
  }), [getCyclesByStatus, isLoading]);
};

// Hook para estadísticas de ciclos
export const useSchoolCycleStats = () => {
  const { stats, cycles, getActiveCycleInfo } = useSchoolCycleContext();
  const activeInfo = getActiveCycleInfo();
  
  return useMemo(() => ({
    ...stats,
    activeCycle: activeInfo,
    hasActiveCycle: activeInfo.isActive,
    academicYear: activeInfo.academicYear,
  }), [stats, activeInfo]);
};

// Hook para acciones de ciclos escolares
export const useSchoolCycleActions = () => {
  const {
    createCycle,
    updateCycle,
    isCreating,
    isUpdating,
    refetchAll,
    clearCache,
    validateNewCycle,
  } = useSchoolCycleContext();

  return {
    createCycle,
    updateCycle,
    validateNewCycle,
    isCreating,
    isUpdating,
    refetchAll,
    clearCache,
    isMutating: isCreating || isUpdating,
  };
};

// Hook para selección de ciclo escolar
export const useSchoolCycleSelection = () => {
  const { cycles, getCycleById, activeCycle } = useSchoolCycleContext();
  const [selectedCycleId, setSelectedCycleId] = React.useState<string | number | null>(null);

  const selectedCycle = useMemo(() => {
    if (selectedCycleId) {
      return getCycleById(selectedCycleId) || null;
    }
    return null;
  }, [selectedCycleId, getCycleById]);

  const selectCycle = useCallback((id: string | number | null) => {
    setSelectedCycleId(id);
  }, []);

  const selectActiveCycle = useCallback(() => {
    if (activeCycle) {
      setSelectedCycleId(activeCycle.id);
    }
  }, [activeCycle]);

  return {
    selectedCycle,
    selectedCycleId,
    selectCycle,
    selectActiveCycle,
    availableCycles: cycles,
  };
};

// Hook para validaciones de ciclos
export const useSchoolCycleValidations = () => {
  const { validateNewCycle, stats } = useSchoolCycleContext();
  
  const canCreateCycle = useMemo(() => {
    return !stats.hasMultipleActive;
  }, [stats.hasMultipleActive]);

  const validateCycleData = useCallback((data: SchoolCyclePayload) => {
    const validation = validateNewCycle(data);
    
    // Validaciones adicionales
    const warnings: string[] = [];
    
    if (data.isActive && stats.activeCycles > 0) {
      warnings.push('Ya existe un ciclo activo. Esto desactivará el actual.');
    }
    
    const cycleYear = new Date(data.startDate).getFullYear();
    const currentYear = new Date().getFullYear();
    
    if (cycleYear > currentYear + 2) {
      warnings.push('El ciclo está muy en el futuro.');
    }
    
    if (cycleYear < currentYear - 1) {
      warnings.push('El ciclo está en el pasado.');
    }
    
    return {
      ...validation,
      warnings,
      canCreate: canCreateCycle
    };
  }, [validateNewCycle, stats, canCreateCycle]);

  return {
    validateCycleData,
    canCreateCycle,
    hasMultipleActive: stats.hasMultipleActive,
  };
};

export default SchoolCycleProvider;