"use client";

// contexts/BimesterContext.tsx
import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useBimestersByCycle,
  useActiveBimester,
  useCreateBimester,
  useUpdateBimester,
  bimesterKeys
} from '@/hooks/useBimesters';
import {
  Bimester,
  SchoolBimesterPayload
} from '@/types/SchoolBimesters';
import { useCurrentSchoolCycle } from '@/context/SchoolCycleContext';

// ==================== TIPOS DEL CONTEXT ====================
interface BimesterContextValue {
  // Datos principales
  bimesters: Bimester[];
  activeBimester: Bimester | null;
  
  // Estados de carga
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  
  // Ciclo escolar activo
  cycleId: number;
  
  // Funciones de mutación
  createBimester: (data: SchoolBimesterPayload) => Promise<Bimester>;
  updateBimester: (id: number, data: Partial<SchoolBimesterPayload>) => Promise<Bimester>;
  
  // Estados de mutación
  isCreating: boolean;
  isUpdating: boolean;
  
  // Utilidades
  getBimesterById: (id: number) => Bimester | undefined;
  getBimesterByNumber: (number: number) => Bimester | undefined;
  getBimestersByStatus: () => {
    active: Bimester[];
    completed: Bimester[];
    upcoming: Bimester[];
  };
  getActiveBimesterInfo: () => {
    bimester: Bimester | null;
    isActive: boolean;
    daysRemaining: number;
    progress: number;
    weeksCount: number;
  };
  refetchAll: () => void;
  clearCache: () => void;
  
  // Estadísticas globales
  stats: {
    totalBimesters: number;
    completedBimesters: number;
    upcomingBimesters: number;
    activeBimesterNumber: number | null;
    yearProgress: number;
  };
}

interface BimesterProviderProps {
  children: React.ReactNode;
}

// ==================== CONTEXT ====================
const BimesterContext = createContext<BimesterContextValue | undefined>(undefined);

// ==================== PROVIDER ====================
export const BimesterProvider: React.FC<BimesterProviderProps> = ({
  children
}) => {
  const queryClient = useQueryClient();

  // ✅ Usar ciclo activo automáticamente del SchoolCycleContext
  const { cycle: activeCycle } = useCurrentSchoolCycle();
  const cycleId = activeCycle?.id || 1; // Fallback a 1 si no hay ciclo activo

  // ========== QUERIES ==========
  const {
    data: bimesters = [],
    isLoading,
    isError,
    error
  } = useBimestersByCycle(cycleId);

  const activeBimester = useActiveBimester(cycleId);

  // ========== MUTATIONS ==========
  const createBimesterMutation = useCreateBimester();
  const updateBimesterMutation = useUpdateBimester();

  // ========== COMPUTED STATES ==========
  const isCreating = createBimesterMutation.isPending;
  const isUpdating = updateBimesterMutation.isPending;

  // ========== ESTADÍSTICAS ==========
  const stats = useMemo(() => {
    const now = new Date();
    const completedBimesters = bimesters.filter(b => new Date(b.endDate) < now);
    const upcomingBimesters = bimesters.filter(b => new Date(b.startDate) > now);

    return {
      totalBimesters: bimesters.length,
      completedBimesters: completedBimesters.length,
      upcomingBimesters: upcomingBimesters.length,
      activeBimesterNumber: activeBimester?.number || null,
      yearProgress: bimesters.length > 0 ? (completedBimesters.length / bimesters.length) * 100 : 0,
    };
  }, [bimesters, activeBimester]);

  // ========== FUNCIONES DE MUTACIÓN ==========
  const createBimester = useCallback(async (data: SchoolBimesterPayload): Promise<Bimester> => {
    return await createBimesterMutation.mutateAsync({ cycleId, data });
  }, [createBimesterMutation, cycleId]);

  const updateBimester = useCallback(async (
    id: number, 
    data: Partial<SchoolBimesterPayload>
  ): Promise<Bimester> => {
    return await updateBimesterMutation.mutateAsync({ id, data });
  }, [updateBimesterMutation]);

  // ========== FUNCIONES UTILITARIAS ==========
  const getBimesterById = useCallback((id: number): Bimester | undefined => {
    return bimesters.find(bimester => bimester.id === id);
  }, [bimesters]);

  const getBimesterByNumber = useCallback((number: number): Bimester | undefined => {
    return bimesters.find(bimester => bimester.number === number);
  }, [bimesters]);

  const getBimestersByStatus = useCallback(() => {
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

    return { active, completed, upcoming };
  }, [bimesters]);

  const getActiveBimesterInfo = useCallback(() => {
    const now = new Date();
    let activeBimesterData: Bimester | null = activeBimester;

    const isActive = !!activeBimesterData;
    
    let daysRemaining = 0;
    let progress = 0;
    let weeksCount = 0;

    if (activeBimesterData) {
      const endDate = new Date(activeBimesterData.endDate);
      const startDate = new Date(activeBimesterData.startDate);
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const elapsedDays = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      progress = totalDays > 0 ? Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100)) : 0;
      weeksCount = activeBimesterData.weeksCount || 8; // Default a 8 semanas
    }

    return {
      bimester: activeBimesterData,
      isActive,
      daysRemaining,
      progress,
      weeksCount,
    };
  }, [activeBimester]);

  const refetchAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: bimesterKeys.all });
  }, [queryClient]);

  const clearCache = useCallback(() => {
    queryClient.removeQueries({ queryKey: bimesterKeys.all });
  }, [queryClient]);

  // ========== CONTEXT VALUE ==========
  const contextValue: BimesterContextValue = useMemo(() => ({
    // Datos principales
    bimesters,
    activeBimester,
    
    // Estados de carga
    isLoading,
    isError,
    error,
    
    // Ciclo escolar
    cycleId,
    
    // Funciones de mutación
    createBimester,
    updateBimester,
    
    // Estados de mutación
    isCreating,
    isUpdating,
    
    // Utilidades
    getBimesterById,
    getBimesterByNumber,
    getBimestersByStatus,
    getActiveBimesterInfo,
    refetchAll,
    clearCache,
    
    // Estadísticas
    stats,
  }), [
    bimesters,
    activeBimester,
    isLoading,
    isError,
    error,
    cycleId,
    createBimester,
    updateBimester,
    isCreating,
    isUpdating,
    getBimesterById,
    getBimesterByNumber,
    getBimestersByStatus,
    getActiveBimesterInfo,
    refetchAll,
    clearCache,
    stats,
  ]);

  return (
    <BimesterContext.Provider value={contextValue}>
      {children}
    </BimesterContext.Provider>
  );
};

// ==================== HOOK PERSONALIZADO ====================
export const useBimesterContext = (): BimesterContextValue => {
  const context = useContext(BimesterContext);
  
  if (context === undefined) {
    throw new Error('useBimesterContext debe ser usado dentro de BimesterProvider');
  }
  
  return context;
};

// ==================== HOOKS ESPECIALIZADOS ====================

// Hook para obtener solo el bimestre activo
export const useCurrentBimester = () => {
  const { getActiveBimesterInfo } = useBimesterContext();
  return getActiveBimesterInfo();
};

// Hook para obtener bimestres de un ciclo específico
export const useCycleBimesters = (targetCycleId?: number) => {
  const { bimesters, cycleId, isLoading } = useBimesterContext();
  
  return useMemo(() => ({
    bimesters: targetCycleId && targetCycleId !== cycleId ? [] : bimesters,
    isLoading: targetCycleId && targetCycleId !== cycleId ? false : isLoading,
    cycleId: targetCycleId || cycleId,
  }), [bimesters, cycleId, targetCycleId, isLoading]);
};

// Hook para estadísticas de bimestres
export const useBimesterStats = () => {
  const { stats, bimesters, getActiveBimesterInfo } = useBimesterContext();
  const activeInfo = getActiveBimesterInfo();
  
  return useMemo(() => ({
    ...stats,
    activeBimester: activeInfo,
    hasActiveBimester: activeInfo.isActive,
    totalWeeksInYear: bimesters.reduce((total, b) => total + (b.weeksCount || 8), 0),
  }), [stats, activeInfo, bimesters]);
};

// Hook para acciones de bimestres
export const useBimesterActions = () => {
  const {
    createBimester,
    updateBimester,
    isCreating,
    isUpdating,
    refetchAll,
    clearCache,
  } = useBimesterContext();

  return {
    createBimester,
    updateBimester,
    isCreating,
    isUpdating,
    refetchAll,
    clearCache,
    isMutating: isCreating || isUpdating,
  };
};

// Hook para obtener bimestres por estado
export const useBimestersByState = () => {
  const { getBimestersByStatus, isLoading } = useBimesterContext();
  
  return useMemo(() => {
    const statusData = getBimestersByStatus();
    return {
      ...statusData,
      isLoading,
    };
  }, [getBimestersByStatus, isLoading]);
};

// Hook para selección de bimestre
export const useBimesterSelection = () => {
  const { bimesters, getBimesterById, activeBimester } = useBimesterContext();
  const [selectedBimesterId, setSelectedBimesterId] = React.useState<number | null>(null);

  const selectedBimester = useMemo(() => {
    if (selectedBimesterId) {
      return getBimesterById(selectedBimesterId) || null;
    }
    return null;
  }, [selectedBimesterId, getBimesterById]);

  const selectBimester = useCallback((id: number | null) => {
    setSelectedBimesterId(id);
  }, []);

  const selectActiveBimester = useCallback(() => {
    if (activeBimester) {
      setSelectedBimesterId(activeBimester.id || null);
    }
  }, [activeBimester]);

  return {
    selectedBimester,
    selectedBimesterId,
    selectBimester,
    selectActiveBimester,
    availableBimesters: bimesters,
  };
};

export default BimesterProvider;