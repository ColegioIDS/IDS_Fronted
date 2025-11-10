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
    async (gId: number, secId: number) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        console.log('[useStudentsBySection] Cargando estudiantes para grado:', gId, 'sección:', secId);

        const rawStudents = await attendanceConfigurationService.getStudentsBySection(gId, secId);

        console.log('[useStudentsBySection] Estudiantes obtenidos:', rawStudents.length);
        console.log('[useStudentsBySection] Estructura de datos:', rawStudents[0]);

        // Transformar la estructura para que coincida con lo que espera el componente
        const transformedStudents = rawStudents.map((student) => ({
          id: student.enrollmentId,
          enrollmentId: student.enrollmentId,
          enrollment: {
            id: student.enrollmentId,
            student: {
              fullName: student.studentName,
            },
          },
          studentName: student.studentName,
          grade: student.grade,
          section: student.section,
          // Estos campos pueden no existir, pero los componentes pueden manejar valores undefined
          status: undefined,
          justification: undefined,
        }));

        console.log('[useStudentsBySection] Estructura transformada:', transformedStudents[0]);

        setState((prev) => ({
          ...prev,
          students: transformedStudents,
          loading: false,
        }));

        return transformedStudents;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        console.error('[useStudentsBySection] Error:', errorMessage);
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));
        throw err;
      }
    },
    []
  );

  /**
   * Efecto: cargar automáticamente cuando cambian gradeId o sectionId
   */
  useEffect(() => {
    console.log('[useStudentsBySection] Efecto disparado:', { gradeId, sectionId });
    // Necesitamos AMBOS: gradeId y sectionId para llamar al endpoint
    if (gradeId && gradeId > 0 && sectionId && sectionId > 0) {
      console.log('[useStudentsBySection] ✅ Condición cumplida, llamando fetchStudents');
      fetchStudents(gradeId, sectionId);
    } else {
      console.log('[useStudentsBySection] ❌ Condición NO cumplida, reseteando estado');
      setState(initialState);
    }
  }, [gradeId, sectionId, fetchStudents]);

  return {
    ...state,
    fetchStudents,
  };
}

export default useStudentsBySection;
