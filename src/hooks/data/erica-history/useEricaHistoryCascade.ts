// hooks/data/erica-history/useEricaHistoryCascade.ts
// Reutiliza la cascada de evaluations pero orientada a history

import { useState, useEffect, useCallback } from 'react';
import { ericaEvaluationsService } from '@/services/erica-evaluations.service';
import {
  CascadeResponse,
  CascadeBimester,
  CascadeWeek,
  CascadeGrade,
  CascadeSection,
  CascadeCourse,
  CascadeCourseAssignment,
} from '@/types/erica-evaluations';

interface CascadeError {
  message: string;
  errorCode?: string;
  errorType?: string;
}

interface UseCascadeState {
  cascadeData: CascadeResponse | null;
  isLoading: boolean;
  error: CascadeError | null;
}

interface SelectedCascadeItems {
  bimester: CascadeBimester | null;
  week: CascadeWeek | null;
  grade: CascadeGrade | null;
  section: CascadeSection | null;
  course: CascadeCourse | null;
}

interface UseEricaHistoryCascadeReturn extends UseCascadeState {
  // Selection state
  selected: SelectedCascadeItems;
  
  // Selection actions
  selectBimester: (bimester: CascadeBimester | null) => void;
  selectWeek: (week: CascadeWeek | null) => void;
  selectGrade: (grade: CascadeGrade | null) => void;
  selectSection: (section: CascadeSection | null) => void;
  selectCourse: (course: CascadeCourse | null) => void;
  
  // Derived getters
  getBimesters: () => CascadeBimester[];
  getWeeks: () => CascadeWeek[];
  getGrades: () => CascadeGrade[];
  getSections: () => CascadeSection[];
  getCourses: () => CascadeCourse[];
  
  // Utility
  isSelectionComplete: boolean;
  resetSelection: () => void;
  refreshCascade: () => Promise<void>;
}

const initialSelection: SelectedCascadeItems = {
  bimester: null,
  week: null,
  grade: null,
  section: null,
  course: null,
};

export function useEricaHistoryCascade(): UseEricaHistoryCascadeReturn {
  const [state, setState] = useState<UseCascadeState>({
    cascadeData: null,
    isLoading: true,
    error: null,
  });
  
  const [selected, setSelected] = useState<SelectedCascadeItems>(initialSelection);

  // Fetch cascade data
  const fetchCascade = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const data = await ericaEvaluationsService.getCascadeData();
      
      // Validate required data exists
      if (!data.activeBimester) {
        setState({
          cascadeData: data,
          isLoading: false,
          error: {
            message: 'No hay un bimestre activo para el ciclo escolar actual',
            errorCode: 'NO_ACTIVE_BIMESTER',
            errorType: 'CONFIGURATION_ERROR',
          },
        });
        return;
      }
      
      if (!data.weeks || data.weeks.length === 0) {
        setState({
          cascadeData: data,
          isLoading: false,
          error: {
            message: 'No hay semanas académicas registradas para este bimestre',
            errorCode: 'NO_WEEKS',
            errorType: 'CONFIGURATION_ERROR',
          },
        });
        return;
      }
      
      if (!data.grades || data.grades.length === 0) {
        setState({
          cascadeData: data,
          isLoading: false,
          error: {
            message: 'No hay grados registrados para este ciclo escolar',
            errorCode: 'NO_GRADES',
            errorType: 'CONFIGURATION_ERROR',
          },
        });
        return;
      }
      
      setState({
        cascadeData: data,
        isLoading: false,
        error: null,
      });
    } catch (err: unknown) {
      let errorInfo: CascadeError = {
        message: 'Error al cargar datos jerárquicos',
      };
      
      if (err instanceof Error) {
        const customErr = err as Error & { errorCode?: string; errorType?: string; detail?: string };
        errorInfo = {
          message: customErr.message,
          errorCode: customErr.errorCode,
          errorType: customErr.errorType,
        };
      } else if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string; errorCode?: string; errorType?: string } } };
        if (axiosErr.response?.data) {
          errorInfo = {
            message: axiosErr.response.data.message || errorInfo.message,
            errorCode: axiosErr.response.data.errorCode,
            errorType: axiosErr.response.data.errorType,
          };
        }
      }
      
      setState({
        cascadeData: null,
        isLoading: false,
        error: errorInfo,
      });
    }
  }, []);

  useEffect(() => {
    fetchCascade();
  }, [fetchCascade]);

  // Selection handlers - cascade down when parent changes
  const selectBimester = useCallback((bimester: CascadeBimester | null) => {
    setSelected({
      bimester,
      week: null,
      grade: null,
      section: null,
      course: null,
    });
  }, []);

  const selectWeek = useCallback((week: CascadeWeek | null) => {
    setSelected(prev => ({
      ...prev,
      week,
      grade: null,
      section: null,
      course: null,
    }));
  }, []);

  const selectGrade = useCallback((grade: CascadeGrade | null) => {
    setSelected(prev => ({
      ...prev,
      grade,
      section: null,
      course: null,
    }));
  }, []);

  const selectSection = useCallback((section: CascadeSection | null) => {
    setSelected(prev => ({
      ...prev,
      section,
      course: null,
    }));
  }, []);

  const selectCourse = useCallback((course: CascadeCourse | null) => {
    setSelected(prev => ({
      ...prev,
      course,
    }));
  }, []);

  // Derived getters
  const getBimesters = useCallback((): CascadeBimester[] => {
    // Si hay un array de bimesters, usarlo; si no, usar activeBimester como array
    if (state.cascadeData?.bimesters && state.cascadeData.bimesters.length > 0) {
      return state.cascadeData.bimesters;
    }
    if (state.cascadeData?.activeBimester) {
      return [state.cascadeData.activeBimester];
    }
    return [];
  }, [state.cascadeData]);

  const getWeeks = useCallback((): CascadeWeek[] => {
    if (!selected.bimester || !state.cascadeData?.weeks) return [];
    return state.cascadeData.weeks.filter(
      (week: CascadeWeek) => week.bimesterId === selected.bimester!.id
    );
  }, [selected.bimester, state.cascadeData]);

  const getGrades = useCallback((): CascadeGrade[] => {
    return state.cascadeData?.grades || [];
  }, [state.cascadeData]);

  const getSections = useCallback((): CascadeSection[] => {
    if (!selected.grade || !state.cascadeData?.gradesSections) return [];
    return state.cascadeData.gradesSections[selected.grade.id] || [];
  }, [selected.grade, state.cascadeData]);

  const getCourses = useCallback((): CascadeCourse[] => {
    if (!selected.section || !selected.section.courseAssignments) return [];
    return selected.section.courseAssignments.map((assignment: CascadeCourseAssignment) => assignment.course);
  }, [selected.section]);

  const isSelectionComplete = Boolean(
    selected.bimester &&
    selected.week &&
    selected.grade &&
    selected.section &&
    selected.course
  );

  const resetSelection = useCallback(() => {
    setSelected(initialSelection);
  }, []);

  const refreshCascade = useCallback(async () => {
    await fetchCascade();
  }, [fetchCascade]);

  return {
    cascadeData: state.cascadeData,
    isLoading: state.isLoading,
    error: state.error,
    selected,
    selectBimester,
    selectWeek,
    selectGrade,
    selectSection,
    selectCourse,
    getBimesters,
    getWeeks,
    getGrades,
    getSections,
    getCourses,
    isSelectionComplete,
    resetSelection,
    refreshCascade,
  };
}
