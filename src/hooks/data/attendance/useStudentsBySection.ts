/**
 * Hook para obtener estudiantes matriculados de una sección
 * Usa SOLO endpoints del módulo attendance
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { getActiveEnrollmentsBySectionAndCycle } from '@/services/attendance.service';

export interface StudentData {
  id: number;
  enrollmentId: number;  // ✅ Agregado: ID de la matrícula (enrollment)
  name: string;
  enrollmentNumber?: string;
  email?: string;
  identificationNumber?: string;
}

interface UseStudentsBySectionReturn {
  students: StudentData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para obtener estudiantes de una sección
 * @param sectionId - ID de la sección
 * @param cycleId - ID del ciclo escolar
 * @param date - Fecha opcional para filtro
 */
export const useStudentsBySection = (
  sectionId: number | null,
  cycleId: number | null,
  date?: string
): UseStudentsBySectionReturn => {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    if (!sectionId || !cycleId) {
      console.log('🚫 [useStudentsBySection] Sin sectionId o cycleId, limpiando');
      setStudents([]);
      return;
    }

    console.log('📡 [useStudentsBySection] Cargando estudiantes para sectionId:', sectionId, 'cycleId:', cycleId, 'date:', date);

    try {
      setLoading(true);
      setError(null);

      // Obtener estudiantes activos de la sección para el ciclo
      const data = await getActiveEnrollmentsBySectionAndCycle(
        sectionId,
        cycleId,
        date
      );

      if (Array.isArray(data)) {
        console.log('✅ [useStudentsBySection] Recibido', data.length, 'estudiantes');
        const studentsList = data.map((enrollment: unknown) => {
          const e = enrollment as Record<string, unknown>;
          const student = (e.student || e.user || e) as Record<string, unknown>;
          
          // Construir nombre completo desde givenNames y lastNames
          const givenNames = String(student?.givenNames ?? '');
          const lastNames = String(student?.lastNames ?? '');
          const fullName = [givenNames, lastNames].filter(Boolean).join(' ').trim();
          
          return {
            id: Number(student?.id ?? e.id),
            enrollmentId: Number(e.enrollmentId),  // ✅ Mapear enrollmentId del backend
            name: fullName || String(student?.name ?? student?.fullName ?? e.name ?? ''),
            enrollmentNumber: String(e.enrollmentNumber ?? e.id ?? ''),
            email: String(student?.email ?? e.email ?? ''),
            identificationNumber: String(student?.codeSIRE ?? student?.identificationNumber ?? e.identificationNumber ?? ''),
          };
        });
        console.log('📥 [useStudentsBySection] Seteando estado con', studentsList.length, 'estudiantes');
        setStudents(studentsList);
      } else {
        console.log('❌ [useStudentsBySection] Data no es un array');
        setStudents([]);
      }
    } catch (err: unknown) {
      const errorMessage = typeof err === 'object' && err !== null && 'message' in err
        ? String((err as Record<string, unknown>).message)
        : 'Error al obtener estudiantes';
      setError(errorMessage);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [sectionId, cycleId, date]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return {
    students,
    loading,
    error,
    refetch: fetchStudents,
  };
};

export default useStudentsBySection;
