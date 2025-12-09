// hooks/data/erica-evaluations/useEricaCascade.ts
import { useState, useEffect, useCallback } from 'react';
import { ericaEvaluationsService } from '@/services/erica-evaluations.service';
import {
  CascadeResponse,
  CascadeBimester,
  CascadeWeek,
  CascadeGrade,
  CascadeSection,
  CascadeCourse,
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

interface UseCascadeReturn extends UseCascadeState {
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

export function useEricaCascade(): UseCascadeReturn {
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
      // Extract error info from axios response or custom error
      let errorInfo: CascadeError = {
        message: 'Error al cargar datos jerárquicos',
      };
      
      // Check if it's a custom error thrown by the service (business logic error)
      if (err instanceof Error) {
        const customErr = err as Error & { errorCode?: string; errorType?: string; detail?: string };
        errorInfo = {
          message: customErr.message,
          errorCode: customErr.errorCode,
          errorType: customErr.errorType,
        };
      }
      // Check if it's an axios error with response data
      else if (err && typeof err === 'object' && 'response' in err) {
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

  // Derived getters - return available options based on cascade data (flat structure)
  const getBimesters = useCallback((): CascadeBimester[] => {
    // Con estructura plana, solo hay un bimestre activo
    if (state.cascadeData?.activeBimester) {
      return [state.cascadeData.activeBimester];
    }
    return [];
  }, [state.cascadeData]);

  const getWeeks = useCallback((): CascadeWeek[] => {
    // Las semanas vienen directamente del cascade data
    return state.cascadeData?.weeks ?? [];
  }, [state.cascadeData]);

  const getGrades = useCallback((): CascadeGrade[] => {
    // Los grados vienen directamente del cascade data
    return state.cascadeData?.grades ?? [];
  }, [state.cascadeData]);

  const getSections = useCallback((): CascadeSection[] => {
    // Las secciones vienen de gradesSections usando el ID del grado seleccionado
    if (!selected.grade || !state.cascadeData?.gradesSections) {
      return [];
    }
    return state.cascadeData.gradesSections[selected.grade.id] ?? [];
  }, [selected.grade, state.cascadeData]);

  const getCourses = useCallback((): CascadeCourse[] => {
    // Los cursos vienen de courseAssignments en la sección seleccionada
    if (!selected.section?.courseAssignments) {
      return [];
    }
    return selected.section.courseAssignments.map(ca => ca.course);
  }, [selected.section]);

  // Check if complete selection is made
  const isSelectionComplete = Boolean(
    selected.bimester &&
    selected.week &&
    selected.grade &&
    selected.section &&
    selected.course
  );

  // Reset selection
  const resetSelection = useCallback(() => {
    setSelected(initialSelection);
  }, []);

  return {
    // State
    cascadeData: state.cascadeData,
    isLoading: state.isLoading,
    error: state.error,
    
    // Selection
    selected,
    selectBimester,
    selectWeek,
    selectGrade,
    selectSection,
    selectCourse,
    
    // Getters
    getBimesters,
    getWeeks,
    getGrades,
    getSections,
    getCourses,
    
    // Utility
    isSelectionComplete,
    resetSelection,
    refreshCascade: fetchCascade,
  };
}

export default useEricaCascade;
