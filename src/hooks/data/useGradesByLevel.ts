// src/hooks/data/useGradesByLevel.ts

'use client';

import { useState, useEffect } from 'react';
import { gradesService } from '@/services/grades.service';
import { Grade } from '@/types/grades.types';

interface UseGradesByLevelReturn {
  grades: Grade[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * 📚 Hook para obtener grados activos de un nivel específico
 */
export function useGradesByLevel(level: string | null): UseGradesByLevelReturn {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGrades = async () => {
    if (!level) {
      setGrades([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await gradesService.getActiveByLevel(level);
      setGrades(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar grados');
      setGrades([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, [level]);

  return {
    grades,
    isLoading,
    error,
    refresh: fetchGrades,
  };
}

export default useGradesByLevel;
