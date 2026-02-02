// hooks/data/erica-history/useEricaHistoryCascade.ts
// Reutiliza la cascada de evaluations pero orientada a history

import { useState, useEffect, useCallback } from 'react';
import { ericaHistoryService } from '@/services/erica-history.service';
import {
  CascadeResponse,
} from '@/types/erica-history';
import {
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
      const data = await ericaHistoryService.getCascadeData();
      
      // Validate required data exists
      if (!data.bimesters || data.bimesters.length === 0) {
        setState({
          cascadeData: data,
          isLoading: false,
          error: {
            message: 'No hay bimestres registrados para el ciclo escolar actual',
            errorCode: 'NO_ACTIVE_BIMESTER',
            errorType: 'CONFIGURATION_ERROR',
          },
        });
        return;
      }
      
      if (!data.academicWeeks || data.academicWeeks.length === 0) {
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
    // El nuevo endpoint devuelve bimesters como array plano
    return (state.cascadeData?.bimesters || []) as CascadeBimester[];
  }, [state.cascadeData]);

  const getWeeks = useCallback((): CascadeWeek[] => {
    if (!selected.bimester || !state.cascadeData?.academicWeeks) return [];
    // Filtrar semanas que pertenecen al bimestre seleccionado
    return state.cascadeData.academicWeeks.filter((week: any) => {
      // Asumiendo que week tiene bimesterId o similaridad con estructura CascadeWeek
      return week.bimesterId === selected.bimester!.id;
    }) as CascadeWeek[];
  }, [selected.bimester, state.cascadeData]);

  const getGrades = useCallback((): CascadeGrade[] => {
    return (state.cascadeData?.grades || []) as CascadeGrade[];
  }, [state.cascadeData]);

  const getSections = useCallback((): CascadeSection[] => {
    if (!selected.grade || !state.cascadeData?.sections) return [];
    // Filtrar secciones que pertenecen al grado seleccionado
    return state.cascadeData.sections.filter((section: any) => section.gradeId === selected.grade!.id) as CascadeSection[];
  }, [selected.grade, state.cascadeData]);

  const getCourses = useCallback((): CascadeCourse[] => {
    if (!selected.section || !state.cascadeData?.courses) return [];
    // Filtrar cursos que pertenecen a la sección seleccionada
    return state.cascadeData.courses.filter((course: any) => course.sectionId === selected.section!.id) as CascadeCourse[];
  }, [selected.section, state.cascadeData]);

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
