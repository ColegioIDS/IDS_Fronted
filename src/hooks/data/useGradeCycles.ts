// src/hooks/data/useGradeCycles.ts

'use client';

import { useState, useEffect, useCallback } from 'react';
import { gradeCyclesService } from '@/services/grade-cycles.service';
import type {
  GradeCycle,
  CreateGradeCycleDto,
  BulkCreateGradeCycleDto,
} from '@/types/grade-cycles.types';

interface UseGradeCyclesReturn {
  gradeCycles: GradeCycle[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createGradeCycle: (data: CreateGradeCycleDto) => Promise<GradeCycle>;
  bulkCreateGradeCycles: (data: BulkCreateGradeCycleDto) => Promise<void>;
  deleteGradeCycle: (cycleId: number, gradeId: number) => Promise<void>;
}

/**
 * Hook para gestionar relaciones grado-ciclo por ciclo
 */
export function useGradeCyclesByCycle(cycleId: number | null): UseGradeCyclesReturn {
  const [gradeCycles, setGradeCycles] = useState<GradeCycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!cycleId) {
      setGradeCycles([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await gradeCyclesService.getGradesByCycle(cycleId);
      setGradeCycles(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar grados del ciclo');
      setGradeCycles([]);
    } finally {
      setIsLoading(false);
    }
  }, [cycleId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  const createGradeCycle = useCallback(
    async (data: CreateGradeCycleDto): Promise<GradeCycle> => {
      try {
        setError(null);
        const result = await gradeCyclesService.create(data);
        await loadData();
        return result;
      } catch (err: any) {
        setError(err.message || 'Error al crear relación');
        throw err;
      }
    },
    [loadData]
  );

  const bulkCreateGradeCycles = useCallback(
    async (data: BulkCreateGradeCycleDto): Promise<void> => {
      try {
        setError(null);
        await gradeCyclesService.bulkCreate(data);
        await loadData();
      } catch (err: any) {
        setError(err.message || 'Error al crear relaciones');
        throw err;
      }
    },
    [loadData]
  );

  const deleteGradeCycle = useCallback(
    async (cycleId: number, gradeId: number): Promise<void> => {
      try {
        setError(null);
        await gradeCyclesService.delete(cycleId, gradeId);
        await loadData();
      } catch (err: any) {
        setError(err.message || 'Error al eliminar relación');
        throw err;
      }
    },
    [loadData]
  );

  return {
    gradeCycles,
    isLoading,
    error,
    refresh,
    createGradeCycle,
    bulkCreateGradeCycles,
    deleteGradeCycle,
  };
}

/**
 * Hook para gestionar relaciones grado-ciclo por grado
 */
export function useGradeCyclesByGrade(gradeId: number | null): UseGradeCyclesReturn {
  const [gradeCycles, setGradeCycles] = useState<GradeCycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!gradeId) {
      setGradeCycles([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await gradeCyclesService.getCyclesByGrade(gradeId);
      setGradeCycles(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar ciclos del grado');
      setGradeCycles([]);
    } finally {
      setIsLoading(false);
    }
  }, [gradeId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  const createGradeCycle = useCallback(
    async (data: CreateGradeCycleDto): Promise<GradeCycle> => {
      try {
        setError(null);
        const result = await gradeCyclesService.create(data);
        await loadData();
        return result;
      } catch (err: any) {
        setError(err.message || 'Error al crear relación');
        throw err;
      }
    },
    [loadData]
  );

  const bulkCreateGradeCycles = useCallback(
    async (data: BulkCreateGradeCycleDto): Promise<void> => {
      try {
        setError(null);
        await gradeCyclesService.bulkCreate(data);
        await loadData();
      } catch (err: any) {
        setError(err.message || 'Error al crear relaciones');
        throw err;
      }
    },
    [loadData]
  );

  const deleteGradeCycle = useCallback(
    async (cycleId: number, gradeId: number): Promise<void> => {
      try {
        setError(null);
        await gradeCyclesService.delete(cycleId, gradeId);
        await loadData();
      } catch (err: any) {
        setError(err.message || 'Error al eliminar relación');
        throw err;
      }
    },
    [loadData]
  );

  return {
    gradeCycles,
    isLoading,
    error,
    refresh,
    createGradeCycle,
    bulkCreateGradeCycles,
    deleteGradeCycle,
  };
}
