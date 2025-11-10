// src/hooks/data/useBimesterCycles.ts

import { useState, useEffect, useCallback } from 'react';
import { bimesterService } from '@/services/bimester.service';
import {
  SchoolCycleForBimester,
  QueryAvailableCyclesDto,
} from '@/types/bimester.types';

/**
 * Hook para gestionar ciclos escolares desde permisos de bimester
 * Usa los endpoints: /api/bimesters/cycles/*
 * 
 * Caso de uso: Usuario con permisos de bimester necesita seleccionar ciclos
 * para crear/editar bimestres sin tener permisos de school-cycle
 */
export function useBimesterCycles(initialQuery: QueryAvailableCyclesDto = {}) {
  const [cycles, setCycles] = useState<SchoolCycleForBimester[]>([]);
  const [activeCycle, setActiveCycle] = useState<SchoolCycleForBimester | null>(null);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 100,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<QueryAvailableCyclesDto>(initialQuery);

  // Cargar ciclos disponibles (NO archivados)
  const loadAvailableCycles = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await bimesterService.getAvailableCycles(query);
      setCycles(result.data);
      setMeta(result.meta);

  // Debug: log loaded cycles
  // eslint-disable-next-line no-console
  console.log('[useBimesterCycles] loaded cycles ids:', result.data.map((c) => c.id));

      // Auto-seleccionar el ciclo activo si existe
      const active = result.data.find((cycle) => cycle.isActive);
      if (active) {
        setActiveCycle(active);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar ciclos disponibles');
      console.error('Error loading available cycles:', err);
      setCycles([]);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  // Cargar solo el ciclo activo (más rápido)
  const loadActiveCycle = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const cycle = await bimesterService.getActiveCycle();
      setActiveCycle(cycle);
      setCycles([cycle]); // Opcional: guardar en la lista también
    } catch (err: any) {
      setError(err.message || 'Error al cargar ciclo activo');
      console.error('Error loading active cycle:', err);
      setActiveCycle(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obtener detalles de un ciclo específico
  const getCycleDetails = useCallback(async (cycleId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const cycle = await bimesterService.getCycleById(cycleId);
      return cycle;
    } catch (err: any) {
      setError(err.message || 'Error al obtener detalles del ciclo');
      console.error('Error getting cycle details:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Efecto inicial: cargar ciclos disponibles
  useEffect(() => {
    loadAvailableCycles();
  }, [loadAvailableCycles]);

  // Actualizar query
  const updateQuery = useCallback((newQuery: Partial<QueryAvailableCyclesDto>) => {
    setQuery((prev) => ({ ...prev, ...newQuery }));
  }, []);

  // Cambiar página
  const setPage = useCallback((page: number) => {
    setQuery((prev) => ({ ...prev, page }));
  }, []);

  // Refrescar datos
  const refresh = useCallback(() => loadAvailableCycles(), [loadAvailableCycles]);

  return {
    // Datos
    cycles,
    activeCycle,
    meta,
    isLoading,
    error,
    query,

    // Métodos
    updateQuery,
    setPage,
    refresh,
    loadActiveCycle,
    loadAvailableCycles,
    getCycleDetails,

    // Estado local
    setActiveCycle,
  };
}

export default useBimesterCycles;
