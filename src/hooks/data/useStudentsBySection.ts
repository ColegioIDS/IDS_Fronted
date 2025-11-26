// src/hooks/data/useStudentsBySection.ts
/**
 * Hook para obtener estudiantes matriculados en una sección
 * AISLADO: Solo usa attendanceConfigurationService
 */

import { useState, useCallback, useEffect } from 'react';
import { attendanceConfigurationService } from '@/services/attendance-configuration.service';

interface UseStudentsBySectionState {
  students: any[];
  loading: boolean;
  error: string | null;
}

const initialState: UseStudentsBySectionState = {
  students: [],
  loading: false,
  error: null,
};

export function useStudentsBySection(gradeId: number | null, sectionId: number | null) {
  const [state, setState] = useState<UseStudentsBySectionState>(initialState);

  /**
   * Cargar estudiantes de la sección
   */
  const fetchStudents = useCallback(
    async (secId: number) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        console.log('[useStudentsBySection] Cargando estudiantes para sección:', secId);

        const rawStudents = await attendanceConfigurationService.getStudentsBySection(secId);

        console.log('[useStudentsBySection] Estudiantes obtenidos:', rawStudents.length);
        console.log('[useStudentsBySection] Primer estudiante:', rawStudents[0]);

        setState((prev) => ({
          ...prev,
          students: rawStudents,
          loading: false,
        }));

        return rawStudents;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        console.error('[useStudentsBySection] Error:', errorMessage);
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));
        // Return empty array instead of throwing to avoid breaking the UI
        setState((prev) => ({
          ...prev,
          students: [],
          loading: false,
        }));
      }
    },
    []
  );

  /**
   * Efecto: cargar automáticamente cuando cambian gradeId o sectionId
   */
  useEffect(() => {
    console.log('[useStudentsBySection] Efecto disparado:', { gradeId, sectionId });
    // Solo necesitamos sectionId para llamar al endpoint
    if (sectionId && sectionId > 0) {
      console.log('[useStudentsBySection] ✅ Condición cumplida, llamando fetchStudents');
      fetchStudents(sectionId);
    } else {
      console.log('[useStudentsBySection] ❌ Condición NO cumplida, reseteando estado');
      setState(initialState);
    }
  }, [sectionId, fetchStudents]);

  return {
    ...state,
    fetchStudents,
  };
}

export default useStudentsBySection;
