// src/hooks/data/useGrade.ts

'use client';

import { useState, useEffect } from 'react';
import { gradesService } from '@/services/grades.service';
import { Grade } from '@/types/grades.types';

interface UseGradeReturn {
  grade: Grade | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * 📚 Hook para obtener un grado específico por ID
 */
export function useGrade(id: number | null): UseGradeReturn {
  const [grade, setGrade] = useState<Grade | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGrade = async () => {
    if (!id) {
      setGrade(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await gradesService.getById(id);
      setGrade(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el grado');
      setGrade(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGrade();
  }, [id]);

  return {
    grade,
    isLoading,
    error,
    refresh: fetchGrade,
  };
}

export default useGrade;
