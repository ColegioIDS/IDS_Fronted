/**
 * Hook useAssignmentsList
 * Hook centralizado para obtener la lista de tareas
 * Evita llamadas duplicadas cuando múltiples componentes necesitan los datos
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { assignmentsService } from '@/services/assignments.service';

interface Assignment {
  id: number;
  title: string;
  description?: string | null;
  courseId: number;
  bimesterId?: number;
  courseName?: string;
  bimesterName?: string;
  dueDate: string | Date;
  maxScore: number;
  createdAt: string | Date;
  course?: {
    id: number;
    name: string;
    code: string;
  };
  bimester?: {
    name: string;
    number: number;
  };
}

interface UseAssignmentsListProps {
  courseId?: number;
  bimesterId?: number;
  gradeId?: number;
  sectionId?: number;
  limit?: number;
  enabled?: boolean; // Para desactivar la llamada si es necesario
}

interface UseAssignmentsListReturn {
  assignments: Assignment[];
  loading: boolean;
  error: string | null;
  totalScore: number;
  remainingPoints: number;
  refetch: () => Promise<void>;
}

export function useAssignmentsList({
  courseId,
  bimesterId,
  gradeId,
  sectionId,
  limit = 100,
  enabled = true,
}: UseAssignmentsListProps): UseAssignmentsListReturn {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [remainingPoints, setRemainingPoints] = useState(20);

  // Función para cargar tareas
  const fetchAssignments = useCallback(async () => {
    // No hacer nada si no está habilitado o faltan parámetros
    if (!enabled || !courseId || !bimesterId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await assignmentsService.listAssignments({
        courseId,
        bimesterId,
        gradeId,
        sectionId,
        limit,
      });

      const assignmentsList = response.data || [];
      
      // Mapear los datos para asegurar que courseName y bimesterName estén disponibles
      const mappedAssignments = assignmentsList.map((assignment: any) => ({
        ...assignment,
        courseName: assignment.course?.name || assignment.courseName || 'No especificado',
        bimesterName: assignment.bimester?.name || assignment.bimesterName || 'No especificado',
      }));
      
      setAssignments(mappedAssignments);

      // Calcular puntos totales
      const total = mappedAssignments.reduce(
        (sum: number, assignment: any) => sum + (assignment.maxScore || 0),
        0
      );
      setTotalScore(total);
      setRemainingPoints(Math.max(0, 20 - total));
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Error al cargar tareas';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [courseId, bimesterId, gradeId, sectionId, limit, enabled]);

  // Cargar tareas cuando cambian los parámetros
  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // Función para recargar manualmente
  const refetch = useCallback(async () => {
    await fetchAssignments();
  }, [fetchAssignments]);

  return {
    assignments,
    loading,
    error,
    totalScore,
    remainingPoints,
    refetch,
  };
}
