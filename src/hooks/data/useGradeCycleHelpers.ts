// src/hooks/data/useGradeCycleHelpers.ts

'use client';

import { useState, useEffect, useCallback } from 'react';
import { gradeCyclesService } from '@/services/grade-cycles.service';
import type { AvailableGrade, AvailableCycle } from '@/types/grade-cycles.types';

interface UseGradeCycleHelpersReturn {
  grades: AvailableGrade[];
  cycles: AvailableCycle[];
  isLoadingGrades: boolean;
  isLoadingCycles: boolean;
  errorGrades: string | null;
  errorCycles: string | null;
  refreshGrades: () => Promise<void>;
  refreshCycles: () => Promise<void>;
  getAvailableGradesForCycle: (cycleId: number) => Promise<AvailableGrade[]>;
  getAvailableCyclesForGrade: (gradeId: number) => Promise<AvailableCycle[]>;
}

/**
 * Hook para obtener datos auxiliares usando endpoints helper
 * No requiere permisos de grades:read o cycles:read
 */
export function useGradeCycleHelpers(): UseGradeCycleHelpersReturn {
  const [grades, setGrades] = useState<AvailableGrade[]>([]);
  const [cycles, setCycles] = useState<AvailableCycle[]>([]);
  const [isLoadingGrades, setIsLoadingGrades] = useState(true);
  const [isLoadingCycles, setIsLoadingCycles] = useState(true);
  const [errorGrades, setErrorGrades] = useState<string | null>(null);
  const [errorCycles, setErrorCycles] = useState<string | null>(null);

  const loadGrades = useCallback(async () => {
    try {
      setIsLoadingGrades(true);
      setErrorGrades(null);
      const data = await gradeCyclesService.getAvailableGrades();
      setGrades(data);
    } catch (err: any) {
      setErrorGrades(err.message || 'Error al cargar grados');
      setGrades([]);
    } finally {
      setIsLoadingGrades(false);
    }
  }, []);

  const loadCycles = useCallback(async () => {
    try {
      setIsLoadingCycles(true);
      setErrorCycles(null);
      const data = await gradeCyclesService.getAvailableCycles();
      setCycles(data);
    } catch (err: any) {
      setErrorCycles(err.message || 'Error al cargar ciclos');
      setCycles([]);
    } finally {
      setIsLoadingCycles(false);
    }
  }, []);

  useEffect(() => {
    loadGrades();
    loadCycles();
  }, [loadGrades, loadCycles]);

  const refreshGrades = useCallback(async () => {
    await loadGrades();
  }, [loadGrades]);

  const refreshCycles = useCallback(async () => {
    await loadCycles();
  }, [loadCycles]);

  const getAvailableGradesForCycle = useCallback(
    async (cycleId: number): Promise<AvailableGrade[]> => {
      try {
        return await gradeCyclesService.getAvailableGradesForCycle(cycleId);
      } catch (err: any) {
        throw err;
      }
    },
    []
  );

  const getAvailableCyclesForGrade = useCallback(
    async (gradeId: number): Promise<AvailableCycle[]> => {
      try {
        return await gradeCyclesService.getAvailableCyclesForGrade(gradeId);
      } catch (err: any) {
        throw err;
      }
    },
    []
  );

  return {
    grades,
    cycles,
    isLoadingGrades,
    isLoadingCycles,
    errorGrades,
    errorCycles,
    refreshGrades,
    refreshCycles,
    getAvailableGradesForCycle,
    getAvailableCyclesForGrade,
  };
}
