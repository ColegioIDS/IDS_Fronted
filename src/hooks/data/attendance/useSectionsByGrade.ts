/**
 * Hook para obtener secciones de un grado
 * Usa SOLO endpoints del módulo attendance
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSectionsByGrade } from '@/services/attendance.service';

export interface SectionData {
  id: number;
  name: string;
  grade?: string;
}

interface UseSectionsByGradeReturn {
  sections: SectionData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para obtener secciones de un grado
 * @param cycleId - IGNORADO (no se usa en el endpoint de attendance)
 * @param gradeId - ID del grado
 */
export const useSectionsByGrade = (
  _cycleId: number | null,
  gradeId: number | null
): UseSectionsByGradeReturn => {
  const [sections, setSections] = useState<SectionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSections = useCallback(async () => {
    if (!gradeId) {
      setSections([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Obtener secciones del grado desde attendance service
      const data = await getSectionsByGrade(gradeId);
      
      if (Array.isArray(data)) {
        const sectionsList = data.map((section: unknown) => {
          const s = section as Record<string, unknown>;
          return {
            id: Number(s.id),
            name: String(s.name),
            grade: String(s.gradeName ?? ''),
          };
        });
        setSections(sectionsList);
      } else {
        setSections([]);
      }
    } catch (err: unknown) {
      const errorMessage = typeof err === 'object' && err !== null && 'message' in err
        ? String((err as Record<string, unknown>).message)
        : 'Error al obtener secciones';
      setError(errorMessage);
      setSections([]);
    } finally {
      setLoading(false);
    }
  }, [gradeId]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);


  return {
    sections,
    loading,
    error,
    refetch: fetchSections,
  };
};

export default useSectionsByGrade;
