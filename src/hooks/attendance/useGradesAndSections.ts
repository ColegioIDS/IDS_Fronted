// src/hooks/attendance/useGradesAndSections.ts
// ✅ Hook aislado para cargar grados y secciones
'use client';

import { useState, useCallback, useEffect } from 'react';
import { Grade, Section } from '@/types/attendance.types';
import { attendanceConfigurationService } from '@/services/attendance-configuration.service';

interface UseGradesAndSectionsReturn {
  grades: Grade[];
  sections: Section[];
  loading: boolean;
  error: string | null;
  fetchGrades: () => Promise<void>;
  fetchSectionsByGrade: (gradeId: number) => Promise<void>;
  fetchAll: () => Promise<void>;
}

/**
 * Hook para cargar grados y secciones
 * - AISLADO: No usa otros hooks, context o servicios
 * - Cachea datos en localStorage para optimizar
 */
export function useGradesAndSections(): UseGradesAndSectionsReturn {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGrades = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // ⚠️ DEVELOPMENT: Deshabilitamos caché para ver las llamadas al API
      // const cached = attendanceConfigurationService.getCachedGrades();
      // if (cached) {
      //   setGrades(cached);
      //   return;
      // }

      // Si no hay caché, obtener del API
      const data = await attendanceConfigurationService.getGrades();
      setGrades(data);
      attendanceConfigurationService.setCachedGrades(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar grados';
      setError(message);
      console.error('fetchGrades error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSectionsByGrade = useCallback(async (gradeId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await attendanceConfigurationService.getSectionsByGrade(gradeId);
      setSections(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar secciones';
      setError(message);
      console.error('fetchSectionsByGrade error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await attendanceConfigurationService.getGradesAndSections();
      setGrades(response.data.grades);
      setSections(response.data.sections);
      attendanceConfigurationService.setCachedGrades(response.data.grades);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar configuración';
      setError(message);
      console.error('fetchAll error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch en mount
  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  return {
    grades,
    sections,
    loading,
    error,
    fetchGrades,
    fetchSectionsByGrade,
    fetchAll,
  };
}
