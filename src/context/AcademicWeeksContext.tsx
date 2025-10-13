// contexts/AcademicWeekContext.tsx
"use client";
import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useAcademicWeeks,
  useCurrentWeek,
  useCreateAcademicWeek,
  useUpdateAcademicWeek,
  useDeleteAcademicWeek,
  useGenerateWeeks,
  academicWeekKeys,
  useRegularWeeksByBimester, // ✅ NUEVO
  useEvaluationWeekByBimester, // ✅ NUEVO
} from '@/hooks/useAcademicWeeks';
import {
  AcademicWeek,
  AcademicWeekFormValues,
  UpdateAcademicWeekFormValues,
  AcademicWeekFilters,
  GenerateWeeksRequest,
  CurrentWeekResponse
} from '@/types/academic-week.types';

// ==================== TIPOS DEL CONTEXT ====================
interface AcademicWeekContextValue {
   canFillErica: (week: AcademicWeek) => boolean;
  isEvaluationWeek: (week: AcademicWeek) => boolean;
  getRegularWeeks: (bimesterId: number) => AcademicWeek[];
  getEvaluationWeek: (bimesterId: number) => AcademicWeek | null;


  // Datos principales
  weeks: AcademicWeek[];
  currentWeek: CurrentWeekResponse | undefined;
  
  // Estados de carga
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  
  // Filtros activos
  filters: AcademicWeekFilters;
  setFilters: (filters: AcademicWeekFilters) => void;
  clearFilters: () => void;
  
  // Funciones de mutación
  createWeek: (data: AcademicWeekFormValues) => Promise<AcademicWeek>;
  updateWeek: (id: number, data: UpdateAcademicWeekFormValues) => Promise<AcademicWeek>;
  deleteWeek: (id: number) => Promise<void>;
  generateWeeks: (bimesterId: number, options?: GenerateWeeksRequest) => Promise<AcademicWeek[]>;
  
  // Estados de mutación
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isGenerating: boolean;
  
  // Utilidades
  getWeeksByBimester: (bimesterId: number) => AcademicWeek[];
  getWeekByNumber: (bimesterId: number, number: number) => AcademicWeek | undefined;
  getCurrentWeekInfo: () => {
    week: AcademicWeek | null;
    isActive: boolean;
    daysRemaining: number;
    progress: number;
  };
  refetchAll: () => void;
  clearCache: () => void;
  
  // Estadísticas globales
  stats: {
    totalWeeks: number;
    activeBimesters: number;
    completedWeeks: number;
    upcomingWeeks: number;
  };
}

interface AcademicWeekProviderProps {
  children: React.ReactNode;
  defaultFilters?: AcademicWeekFilters;
}


// ==================== CONTEXT ====================
const AcademicWeekContext = createContext<AcademicWeekContextValue | undefined>(undefined);

// ==================== PROVIDER ====================
export const AcademicWeekProvider: React.FC<AcademicWeekProviderProps> = ({
  children,
  defaultFilters = {}
}) => {
  const queryClient = useQueryClient();
  const [filters, setFiltersState] = React.useState<AcademicWeekFilters>(defaultFilters);

  // ========== QUERIES ==========
const {
  data: weeks = [],
  isLoading: isLoadingWeeks,
  isError: isErrorWeeks,
  error: errorWeeks
} = useAcademicWeeks(filters);

const {
  data: currentWeek,
  isLoading: isLoadingCurrent,
  isError: isErrorCurrent,
  error: errorCurrent
} = useCurrentWeek();

  // ========== MUTATIONS ==========
const createWeekMutation = useCreateAcademicWeek();
const updateWeekMutation = useUpdateAcademicWeek();
const deleteWeekMutation = useDeleteAcademicWeek();
const generateWeeksMutation = useGenerateWeeks();


  // ========== FUNCIONES DE VERIFICACIÓN ==========
const canFillErica = useCallback((week: AcademicWeek): boolean => {
  return week.weekType === 'REGULAR'; // ✅ Cambiar 'type' por 'weekType'
}, []);

const isEvaluationWeek = useCallback((week: AcademicWeek): boolean => {
  return week.weekType === 'EVALUATION'; // ✅ Cambiar 'type' por 'weekType'
}, []);


const getRegularWeeks = useCallback((bimesterId: number): AcademicWeek[] => {
  return weeks.filter(week => week.bimesterId === bimesterId && week.weekType === 'REGULAR');
}, [weeks]);

const getEvaluationWeek = useCallback((bimesterId: number): AcademicWeek | null => {
  const evaluationWeek = weeks.find(
    week => week.bimesterId === bimesterId && week.weekType === 'EVALUATION'
  );
  return evaluationWeek || null;
}, [weeks]);


  // ========== COMPUTED STATES ==========
  const isLoading = isLoadingWeeks || isLoadingCurrent;
  const isError = isErrorWeeks || isErrorCurrent;
  const error = errorWeeks || errorCurrent;

  const isCreating = createWeekMutation.isPending;
  const isUpdating = updateWeekMutation.isPending;
  const isDeleting = deleteWeekMutation.isPending;
  const isGenerating = generateWeeksMutation.isPending;

  // ========== ESTADÍSTICAS ==========
  const stats = useMemo(() => {
    const now = new Date();
    const uniqueBimesters = new Set(weeks.map(w => w.bimesterId));
    const completedWeeks = weeks.filter(w => new Date(w.endDate) < now);
    const upcomingWeeks = weeks.filter(w => new Date(w.startDate) > now);

    return {
      totalWeeks: weeks.length,
      activeBimesters: uniqueBimesters.size,
      completedWeeks: completedWeeks.length,
      upcomingWeeks: upcomingWeeks.length,
    };
  }, [weeks]);

  // ========== FUNCIONES DE FILTROS ==========
  const setFilters = useCallback((newFilters: AcademicWeekFilters) => {
    setFiltersState(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({});
  }, []);

  // ========== FUNCIONES DE MUTACIÓN ==========
  const createWeek = useCallback(async (data: AcademicWeekFormValues): Promise<AcademicWeek> => {
    return await createWeekMutation.mutateAsync(data);
  }, [createWeekMutation]);

  const updateWeek = useCallback(async (
    id: number, 
    data: UpdateAcademicWeekFormValues
  ): Promise<AcademicWeek> => {
    return await updateWeekMutation.mutateAsync({ id, data });
  }, [updateWeekMutation]);

  const deleteWeek = useCallback(async (id: number): Promise<void> => {
    await deleteWeekMutation.mutateAsync(id);
  }, [deleteWeekMutation]);

  const generateWeeks = useCallback(async (
    bimesterId: number, 
    options?: GenerateWeeksRequest
  ): Promise<AcademicWeek[]> => {
    return await generateWeeksMutation.mutateAsync({ bimesterId, options });
  }, [generateWeeksMutation]);

  // ========== FUNCIONES UTILITARIAS ==========
  const getWeeksByBimester = useCallback((bimesterId: number): AcademicWeek[] => {
    return weeks.filter(week => week.bimesterId === bimesterId);
  }, [weeks]);

  const getWeekByNumber = useCallback((
    bimesterId: number, 
    number: number
  ): AcademicWeek | undefined => {
    return weeks.find(week => week.bimesterId === bimesterId && week.number === number);
  }, [weeks]);

  const getCurrentWeekInfo = useCallback(() => {
    const now = new Date();
    let currentWeekData: AcademicWeek | null = null;

    // Buscar semana actual en el contexto local
    if (currentWeek && currentWeek.id) {
      currentWeekData = weeks.find(w => w.id === currentWeek.id) || null;
    }

    if (!currentWeekData) {
      // Fallback: buscar por fechas
      currentWeekData = weeks.find(week => {
        const start = new Date(week.startDate);
        const end = new Date(week.endDate);
        return start <= now && now <= end;
      }) || null;
    }

    const isActive = !!currentWeekData;
    
    let daysRemaining = 0;
    let progress = 0;

    if (currentWeekData) {
      const endDate = new Date(currentWeekData.endDate);
      const startDate = new Date(currentWeekData.startDate);
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const elapsedDays = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      progress = totalDays > 0 ? Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100)) : 0;
    }

    return {
      week: currentWeekData,
      isActive,
      daysRemaining,
      progress,
    };
  }, [weeks, currentWeek]);

  const refetchAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: academicWeekKeys.all });
  }, [queryClient]);

  const clearCache = useCallback(() => {
    queryClient.removeQueries({ queryKey: academicWeekKeys.all });
  }, [queryClient]);

  // ========== CONTEXT VALUE ==========
  const contextValue: AcademicWeekContextValue = useMemo(() => ({

      canFillErica,
  isEvaluationWeek,
  getRegularWeeks,
  getEvaluationWeek,
    // Datos principales
    weeks,
    currentWeek,
    
    // Estados de carga
    isLoading,
    isError,
    error,
    
    // Filtros
    filters,
    setFilters,
    clearFilters,
    
    // Funciones de mutación
    createWeek,
    updateWeek,
    deleteWeek,
    generateWeeks,
    
    // Estados de mutación
    isCreating,
    isUpdating,
    isDeleting,
    isGenerating,
    
    // Utilidades
    getWeeksByBimester,
    getWeekByNumber,
    getCurrentWeekInfo,
    refetchAll,
    clearCache,
    
    // Estadísticas
    stats,
}), [
  canFillErica,
  isEvaluationWeek,
  getRegularWeeks,
  getEvaluationWeek,
  weeks,
  currentWeek,
  isLoading,
  isError,
  error,
  filters,
  setFilters,
  clearFilters,
  createWeek,
  updateWeek,
  deleteWeek,
  generateWeeks,
  isCreating,
  isUpdating,
  isDeleting,
  isGenerating,
  getWeeksByBimester,
  getWeekByNumber,
  getCurrentWeekInfo,
  refetchAll,
  clearCache,
  stats,
]);

  return (
    <AcademicWeekContext.Provider value={contextValue}>
      {children}
    </AcademicWeekContext.Provider>
  );
};

// ==================== HOOK PERSONALIZADO ====================
export const useAcademicWeekContext = (): AcademicWeekContextValue => {
  const context = useContext(AcademicWeekContext);
  
  if (context === undefined) {
    throw new Error('useAcademicWeekContext debe ser usado dentro de AcademicWeekProvider');
  }
  
  return context;
};

// ==================== HOOKS ESPECIALIZADOS ====================

// Hook para obtener solo la semana actual
export const useCurrentAcademicWeek = () => {
  const { getCurrentWeekInfo } = useAcademicWeekContext();
  return getCurrentWeekInfo();
};

// Hook para obtener semanas de un bimestre específico
export const useBimesterWeeks = (bimesterId: number) => {
  const { getWeeksByBimester, isLoading } = useAcademicWeekContext();
  
  return useMemo(() => ({
    weeks: getWeeksByBimester(bimesterId),
    isLoading,
  }), [getWeeksByBimester, bimesterId, isLoading]);
};

// Hook para estadísticas de semanas
export const useAcademicWeekStats = () => {
  const { stats, weeks, getCurrentWeekInfo } = useAcademicWeekContext();
  const currentInfo = getCurrentWeekInfo();
  
  return useMemo(() => ({
    ...stats,
    currentWeek: currentInfo,
    hasActiveWeek: currentInfo.isActive,
  }), [stats, currentInfo]);
};

// Hook para acciones de semanas académicas
export const useAcademicWeekActions = () => {
  const {
    createWeek,
    updateWeek,
    deleteWeek,
    generateWeeks,
    isCreating,
    isUpdating,
    isDeleting,
    isGenerating,
    refetchAll,
    clearCache,
  } = useAcademicWeekContext();

  return {
    createWeek,
    updateWeek,
    deleteWeek,
    generateWeeks,
    isCreating,
    isUpdating,
    isDeleting,
    isGenerating,
    refetchAll,
    clearCache,
    isMutating: isCreating || isUpdating || isDeleting || isGenerating,
  };
};

export default AcademicWeekProvider;