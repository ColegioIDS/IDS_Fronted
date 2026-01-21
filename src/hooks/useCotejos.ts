/**
 * Hook personalizado para gestionar cotejos
 */

import { useState, useEffect, useCallback } from 'react';
import { CotejoResponse, CascadeResponse, StudentEnrollmentData, GetStudentsResponse } from '@/types/cotejos.types';
import * as CotejosService from '@/services/cotejos.service';
import { extractCotejosError, CotejosError, logCotejosError } from '@/utils/cotejos-error.utils';

// ==================== INTERFACES DE ESTADO ====================

interface ApiError {
  message: string;
  code?: string;
  detail?: string;
}

interface UseCotejoState {
  cotejo: CotejoResponse | null;
  loading: boolean;
  error: ApiError | null;
}

/**
 * Hook para obtener un cotejo específico
 */
export const useCotejo = (id: number | null) => {
  const [state, setState] = useState<UseCotejoState>({
    cotejo: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!id) return;

    const fetchCotejo = async () => {
      setState({ cotejo: null, loading: true, error: null });
      try {
        const data = await CotejosService.getCotejo(id);
        setState({ cotejo: data, loading: false, error: null });
      } catch (err) {
        const cotejosError = extractCotejosError(err);
        logCotejosError(cotejosError.errorCode, `useCotejo(${id})`, cotejosError.detail);
        setState({
          cotejo: null,
          loading: false,
          error: {
            message: cotejosError.message,
            code: cotejosError.errorCode,
            detail: cotejosError.detail,
          },
        });
      }
    };

    fetchCotejo();
  }, [id]);

  return state;
};

// ==================== CASCADA ====================

interface UseCascadeState {
  cascade: CascadeResponse | null;
  loading: boolean;
  error: ApiError | null;
}

/**
 * Hook para obtener datos en cascada (ciclo, bimestres, grados, secciones, cursos)
 */
export const useCascade = (includeInactive: boolean = false) => {
  const [state, setState] = useState<UseCascadeState>({
    cascade: null,
    loading: false,
    error: null,
  });

  const refetch = useCallback(async () => {
    setState({ cascade: null, loading: true, error: null });
    try {
      const data = await CotejosService.getCascadeData(includeInactive);
      setState({ cascade: data, loading: false, error: null });
    } catch (err) {
      const cotejosError = extractCotejosError(err);
      logCotejosError(cotejosError.errorCode, 'useCascade', cotejosError.detail);
      setState({
        cascade: null,
        loading: false,
        error: {
          message: cotejosError.message,
          code: cotejosError.errorCode,
          detail: cotejosError.detail,
        },
      });
    }
  }, [includeInactive]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { ...state, refetch };
};

// ==================== ESTUDIANTES ====================

interface UseStudentsState {
  students: StudentEnrollmentData[];
  cycle: GetStudentsResponse['cycle'] | null;
  totalStudents: number;
  loading: boolean;
  error: ApiError | null;
}

/**
 * Hook para obtener lista de estudiantes con sus datos de inscripción
 */
export const useStudents = (status: 'all' | 'active' | 'inactive' = 'all') => {
  const [state, setState] = useState<UseStudentsState>({
    students: [],
    cycle: null,
    totalStudents: 0,
    loading: false,
    error: null,
  });

  const refetch = useCallback(async () => {
    setState({ students: [], cycle: null, totalStudents: 0, loading: true, error: null });
    try {
      const data = await CotejosService.getStudents(status);
      setState({
        students: data.students || [],
        cycle: data.cycle || null,
        totalStudents: data.totalStudents || 0,
        loading: false,
        error: null,
      });
    } catch (err) {
      const cotejosError = extractCotejosError(err);
      logCotejosError(cotejosError.errorCode, 'useStudents', cotejosError.detail);
      setState({
        students: [],
        cycle: null,
        totalStudents: 0,
        loading: false,
        error: {
          message: cotejosError.message,
          code: cotejosError.errorCode,
          detail: cotejosError.detail,
        },
      });
    }
  }, [status]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { ...state, refetch };
};

// ==================== COTEJOS POR SECCIÓN ====================

interface UseCotejosBySectionState {
  cotejos: CotejoResponse[];
  total: number;
  loading: boolean;
  error: ApiError | null;
}

interface UseCotejosBySectionParams {
  sectionId: number | null;
  courseId: number | null;
  bimesterId: number | null;
  cycleId: number | null;
}

/**
 * Hook para obtener cotejos de una sección
 */
export const useCotejosBySection = (params: UseCotejosBySectionParams) => {
  const [state, setState] = useState<UseCotejosBySectionState>({
    cotejos: [],
    total: 0,
    loading: false,
    error: null,
  });

  const refetch = useCallback(async () => {
    const { sectionId, courseId, bimesterId, cycleId } = params;
    if (!sectionId || !courseId || !bimesterId || !cycleId) {
      // Si faltan parámetros, reinicia a estado vacío
      setState({ cotejos: [], total: 0, loading: false, error: null });
      return;
    }

    setState({ cotejos: [], total: 0, loading: true, error: null });
    try {
      const data = await CotejosService.getCotejosBySection(
        sectionId,
        courseId,
        bimesterId,
        cycleId,
      );
      setState({ cotejos: data.cotejos || [], total: data.total || 0, loading: false, error: null });
    } catch (err) {
      const cotejosError = extractCotejosError(err);
      logCotejosError(cotejosError.errorCode, 'useCotejosBySection', cotejosError.detail);
      setState({
        cotejos: [],
        total: 0,
        loading: false,
        error: {
          message: cotejosError.message,
          code: cotejosError.errorCode,
          detail: cotejosError.detail,
        },
      });
    }
  }, [params.sectionId, params.courseId, params.bimesterId, params.cycleId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { ...state, refetch };
};

// ==================== MUTACIONES ====================

/**
 * Hook para actualizar puntuación actitudinal
 */
export const useUpdateActitudinal = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const mutate = useCallback(
    async (id: number, actitudinalScore: number, feedback?: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await CotejosService.updateActitudinal(id, {
          actitudinalScore,
          feedback,
        });
        setLoading(false);
        return result;
      } catch (err) {
        const cotejosError = extractCotejosError(err);
        logCotejosError(cotejosError.errorCode, `useUpdateActitudinal(${id})`, cotejosError.detail);
        setError({
          message: cotejosError.message,
          code: cotejosError.errorCode,
          detail: cotejosError.detail,
        });
        setLoading(false);
        throw cotejosError;
      }
    },
    [],
  );

  return { mutate, loading, error };
};

/**
 * Hook para actualizar puntuación declarativa
 */
export const useUpdateDeclarativo = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const mutate = useCallback(
    async (id: number, declarativoScore: number, feedback?: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await CotejosService.updateDeclarativo(id, {
          declarativoScore,
          feedback,
        });
        setLoading(false);
        return result;
      } catch (err) {
        const cotejosError = extractCotejosError(err);
        logCotejosError(cotejosError.errorCode, `useUpdateDeclarativo(${id})`, cotejosError.detail);
        setError({
          message: cotejosError.message,
          code: cotejosError.errorCode,
          detail: cotejosError.detail,
        });
        setLoading(false);
        throw cotejosError;
      }
    },
    [],
  );

  return { mutate, loading, error };
};

/**
 * Hook para generar/recalcular cotejo
 */
export const useGenerateCotejo = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const mutate = useCallback(
    async (
      enrollmentId: number,
      courseId: number,
      bimesterId: number,
      cycleId: number,
      feedback?: string,
    ) => {
      setLoading(true);
      setError(null);
      try {
        const result = await CotejosService.generateCotejo(
          enrollmentId,
          courseId,
          bimesterId,
          cycleId,
          { feedback },
        );
        setLoading(false);
        return result;
      } catch (err) {
        const cotejosError = extractCotejosError(err);
        logCotejosError(cotejosError.errorCode, `useGenerateCotejo(${enrollmentId})`, cotejosError.detail);
        setError({
          message: cotejosError.message,
          code: cotejosError.errorCode,
          detail: cotejosError.detail,
        });
        setLoading(false);
        throw cotejosError;
      }
    },
    [],
  );

  return { mutate, loading, error };
};

/**
 * Hook para finalizar cotejo
 */
export const useSubmitCotejo = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const mutate = useCallback(async (id: number, feedback?: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await CotejosService.submitCotejo(id, { feedback });
      setLoading(false);
      return result;
    } catch (err) {
      const cotejosError = extractCotejosError(err);
      logCotejosError(cotejosError.errorCode, `useSubmitCotejo(${id})`, cotejosError.detail);
      setError({
        message: cotejosError.message,
        code: cotejosError.errorCode,
        detail: cotejosError.detail,
      });
      setLoading(false);
      throw cotejosError;
    }
  }, []);

  return { mutate, loading, error };
};

/**
 * Hook para generar cotejos en bulk para una sección y curso
 */
export const useGenerateCotejosBulk = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const mutate = useCallback(
    async (sectionId: number, courseId: number, bimesterId: number, cycleId: number) => {
      setLoading(true);
      setError(null);
      try {
        const result = await CotejosService.generateCotejosBulk(
          sectionId,
          courseId,
          bimesterId,
          cycleId,
        );
        setLoading(false);
        return result;
      } catch (err) {
        const cotejosError = extractCotejosError(err);
        logCotejosError(
          cotejosError.errorCode,
          `useGenerateCotejosBulk(section=${sectionId})`,
          cotejosError.detail,
        );
        setError({
          message: cotejosError.message,
          code: cotejosError.errorCode,
          detail: cotejosError.detail,
        });
        setLoading(false);
        throw cotejosError;
      }
    },
    [],
  );

  return { mutate, loading, error };
};
