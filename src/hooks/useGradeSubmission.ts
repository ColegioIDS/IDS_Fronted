/**
 * Hook useGradeSubmission
 * Maneja la lógica de calificación de entregas
 */

import { useState, useCallback } from 'react';
import { assignmentsService } from '@/services/assignments.service';

interface GradeData {
  score: number;
  feedback?: string;
}

interface UseGradeSubmissionReturn {
  gradeSubmission: (assignmentId: number, submissionId: number, data: GradeData) => Promise<void>;
  loading: boolean;
  error: string | null;
  success: boolean;
  reset: () => void;
}

export const useGradeSubmission = (): UseGradeSubmissionReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const gradeSubmission = useCallback(
    async (assignmentId: number, submissionId: number, data: GradeData) => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(false);

        // Validar datos
        if (data.score < 0) {
          throw new Error('La puntuación no puede ser negativa');
        }

        // Llamar al servicio
        await assignmentsService.gradeSubmission(assignmentId, submissionId, {
          score: data.score,
          feedback: data.feedback?.trim() || undefined,
        });

        setSuccess(true);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error al calificar la entrega';
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setSuccess(false);
  }, []);

  return {
    gradeSubmission,
    loading,
    error,
    success,
    reset,
  };
};
