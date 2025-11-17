/**
 * ⭐ useActiveCycle.ts
 * Hook AISLADO para obtener el ciclo escolar activo
 * 
 * NO DEPENDE DE:
 *   - Otros hooks
 *   - Otros contexts
 *   - Otros servicios
 *   - Datos mockados
 * 
 * SOLO DEPENDE DE:
 *   - @/config/api (axios client)
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/config/api';

// ============================================================================
// 📋 TIPOS INTERNOS
// ============================================================================

interface SchoolCycleData {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  academicYear: number | null;
  description?: string;
  isActive: boolean;
  isArchived: boolean;
  canEnroll: boolean;
  createdAt: string;
}

interface BimesterData {
  id: number;
  cycleId: number;
  number: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  weeksCount: number;
}

interface ActiveCycleResponse {
  success: boolean;
  data: {
    cycle: SchoolCycleData | null;
    activeBimester: BimesterData | null;
    progress: number;
    daysRemaining: number;
    message?: string;
  };
}

// ============================================================================
// 🎯 HOOK PRINCIPAL
// ============================================================================

/**
 * Hook para obtener el ciclo escolar activo
 * 
 * Auto-fetch en mount
 * 
 * @returns {Object} Estado del ciclo escolar
 * 
 * @example
 * const { cycle, activeBimester, progress, loading, error } = useActiveCycle();
 * 
 * if (loading) return <Spinner />;
 * if (!cycle) return <AlertNoCycle />;
 * 
 * return <div>{cycle.name}</div>;
 */
export function useActiveCycle() {
  const [cycle, setCycle] = useState<SchoolCycleData | null>(null);
  const [activeBimester, setActiveBimester] = useState<BimesterData | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [daysRemaining, setDaysRemaining] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  /**
   * Función para fetch el ciclo activo
   */
  const fetchActiveCycle = useCallback(async (retry: boolean = false) => {
    try {
      if (!retry) {
        setLoading(true);
      } else {
        setIsRetrying(true);
      }

      setError(null);

      console.log('[useActiveCycle] Fetching active cycle from API...');

      const response = await api.get<ActiveCycleResponse>(
        '/api/attendance-config/active-cycle'
      );

      if (!response.data.success) {
        const errorMsg = response.data.data?.message || 'No hay ciclo escolar activo';
        console.warn('[useActiveCycle] No active cycle:', errorMsg);

        // Esto NO es un error de API, solo que no hay ciclo activo
        setCycle(null);
        setActiveBimester(null);
        setProgress(0);
        setDaysRemaining(0);
        setError(null); // NO mostrar como error, es estado normal
        return;
      }

      // Asignar datos
      setCycle(response.data.data.cycle);
      setActiveBimester(response.data.data.activeBimester);
      setProgress(response.data.data.progress || 0);
      setDaysRemaining(response.data.data.daysRemaining || 0);
      setError(null);

      console.log('[useActiveCycle] Cycle data loaded:', {
        cycleName: response.data.data.cycle?.name,
        bimesterName: response.data.data.activeBimester?.name,
        progress: response.data.data.progress,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Error al obtener ciclo escolar activo';

      console.error('[useActiveCycle] Error:', errorMessage);

      setCycle(null);
      setActiveBimester(null);
      setProgress(0);
      setDaysRemaining(0);
      setError(errorMessage);
    } finally {
      if (!retry) {
        setLoading(false);
      } else {
        setIsRetrying(false);
      }
    }
  }, []);

  /**
   * Fetch inicial en mount
   */
  useEffect(() => {
    fetchActiveCycle();
  }, []); // Se ejecuta una sola vez

  /**
   * Reintentar fetch (útil para UI)
   */
  const retry = useCallback(() => {
    fetchActiveCycle(true);
  }, [fetchActiveCycle]);

  /**
   * Estado derivado: ¿hay ciclo activo?
   */
  const hasCycle = !!cycle;

  /**
   * Estado derivado: ¿hay bimestre activo?
   */
  const hasBimester = !!activeBimester;

  return {
    // Datos
    cycle,
    activeBimester,
    progress,
    daysRemaining,

    // Estados
    loading,
    error,
    isRetrying,

    // Derivados
    hasCycle,
    hasBimester,

    // Acciones
    retry,
    fetchActiveCycle,
  };
}

// ============================================================================
// 🔄 HOOK PARA REFETCH MANUAL
// ============================================================================

/**
 * Hook complementario para invalidar caché (util para admin)
 * Cuando se crea un nuevo ciclo o se activa uno
 */
export function useActiveCycleRefresh() {
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const refresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  return { refreshKey, refresh };
}

export default useActiveCycle;
